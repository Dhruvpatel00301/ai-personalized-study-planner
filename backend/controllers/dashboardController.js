const DailySchedule = require("../models/DailySchedule");
const Subject = require("../models/Subject");
const Topic = require("../models/Topic");
const User = require("../models/User");
const { getTodayInTimeZone } = require("../utils/dateTime");
const { resetStreakIfMissedDays } = require("../utils/streakUtils");
const { recalculateSubjectSchedule } = require("./studyPlanController");

const autoRecalculateMissedSubjects = async (userId, timezone) => {
  const today = getTodayInTimeZone(timezone);

  const subjectIds = await DailySchedule.distinct("subjectId", {
    userId,
    date: { $lt: today },
    "tasks.completed": false,
  });

  for (const subjectId of subjectIds) {
    try {
      await recalculateSubjectSchedule({
        userId,
        subjectId,
        startDate: today,
        includeMissed: true,
      });
    } catch (error) {
      console.warn(`Dashboard auto-recalculation failed for subject ${subjectId}: ${error.message}`);
    }
  }
};

const getDashboardSummary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    await autoRecalculateMissedSubjects(user._id, user.timezone);

    const today = getTodayInTimeZone(user.timezone);

    let shouldSaveUser = false;
    if (resetStreakIfMissedDays(user, user.timezone, new Date(today))) {
      shouldSaveUser = true;
    }

    const [todaySchedules, allSchedules, subjectCount, topicsMap] = await Promise.all([
      DailySchedule.find({ userId: user._id, date: today })
        .populate("subjectId", "name examId")
        .populate("subjectId.examId", "name"),
      DailySchedule.find({ userId: user._id }),
      Subject.countDocuments({ userId: user._id, isArchived: false }),
      Topic.find({ userId: user._id }).select("_id strength").lean(),
    ]);

    // build a map of topicId -> strength for quick lookup
    const topicStrengthMap = {};
    topicsMap.forEach((topic) => {
      topicStrengthMap[topic._id] = topic.strength || "normal";
    });

    const todayTasks = todaySchedules.flatMap((schedule) =>
      schedule.tasks.map((task) => ({
        taskId: task._id,
        scheduleId: schedule._id,
        subjectName: schedule.subjectId?.name || "Subject",
        subjectId: schedule.subjectId?._id,
        examName: schedule.subjectId?.examId?.name || "No Exam",
        examId: schedule.subjectId?.examId?._id,
        topicTitle: task.topicTitleSnapshot,
        topicId: task.topicId,
        taskType: task.taskType,
        completed: task.completed,
        strength: topicStrengthMap[task.topicId] || "normal",
      }))
    );

    const allTasks = allSchedules.flatMap((schedule) => schedule.tasks);
    const completedTasks = allTasks.filter((task) => task.completed).length;

    const progressPercent = allTasks.length
      ? Math.round((completedTasks / allTasks.length) * 100)
      : 0;

    if (shouldSaveUser) {
      await user.save();
    }

    return res.json({
      success: true,
      data: {
        date: today,
        todayTasks,
        streakCurrent: user.streakCurrent,
        streakBest: user.streakBest,
        progressPercent,
        subjectCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
