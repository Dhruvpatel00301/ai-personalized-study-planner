const DailySchedule = require("../models/DailySchedule");
const User = require("../models/User");
const { getTodayInTimeZone } = require("../utils/dateTime");
const { incrementStreakForToday } = require("../utils/streakUtils");
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
      console.warn(`Auto recalculation failed for subject ${subjectId}: ${error.message}`);
    }
  }
};

const getTodaySchedule = async (req, res, next) => {
  try {
    await autoRecalculateMissedSubjects(req.user._id, req.user.timezone);

    const today = getTodayInTimeZone(req.user.timezone);
    const schedules = await DailySchedule.find({
      userId: req.user._id,
      date: today,
    }).populate("subjectId", "name");

    const todayTasks = schedules.flatMap((schedule) =>
      schedule.tasks.map((task) => ({
        taskId: task._id,
        scheduleId: schedule._id,
        subjectId: schedule.subjectId?._id,
        subjectName: schedule.subjectId?.name || "Subject",
        topicTitle: task.topicTitleSnapshot,
        taskType: task.taskType,
        completed: task.completed,
      }))
    );

    return res.json({
      success: true,
      data: {
        date: today,
        schedules,
        todayTasks,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const markTaskComplete = async (req, res, next) => {
  try {
    // only allow completing tasks that belong to the current day for the user's timezone
    const today = getTodayInTimeZone(req.user.timezone);
    const schedule = await DailySchedule.findOne({
      userId: req.user._id,
      date: today,
      "tasks._id": req.params.taskId,
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const task = schedule.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!task.completed) {
      task.completed = true;
      task.completedAt = new Date();

      const completedCount = schedule.tasks.filter((item) => item.completed).length;
      schedule.completionPercent = Math.round((completedCount / schedule.tasks.length) * 100);
      await schedule.save();
    }

    const allTodaySchedules = await DailySchedule.find({
      userId: req.user._id,
      date: schedule.date,
    });

    const allTasksDoneToday = allTodaySchedules.every((daySchedule) => daySchedule.completionPercent === 100);

    let streakCurrent;
    if (allTasksDoneToday) {
      const user = await User.findById(req.user._id);
      incrementStreakForToday(user, user.timezone, new Date(schedule.date));
      await user.save();
      streakCurrent = user.streakCurrent;
    }

    return res.json({
      success: true,
      message: "Task updated",
      data: {
        taskId: task._id,
        completed: task.completed,
        completionPercent: schedule.completionPercent,
        streakCurrent,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTodaySchedule,
  markTaskComplete,
};
