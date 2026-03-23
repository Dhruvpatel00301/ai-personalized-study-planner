const DailySchedule = require("../models/DailySchedule");
const Topic = require("../models/Topic");
const { getTodayInTimeZone } = require("../utils/dateTime");
const { recalculateSubjectSchedule } = require("./studyPlanController");

const buildPreview = (schedules) => {
  return schedules.map((schedule) => ({
    date: schedule.date.toISOString().slice(0, 10),
    tasks: (schedule.tasks || []).map((task) => task.topicTitleSnapshot),
  }));
};

const getRecoveryPreview = async (req, res, next) => {
  try {
    const user = req.user;
    const today = getTodayInTimeZone(user.timezone);

    const missedSchedules = await DailySchedule.find({
      userId: user._id,
      date: { $lt: today },
      "tasks.completed": false,
    }).lean();

    const missedDates = Array.from(
      new Set(missedSchedules.map((schedule) => schedule.date.toISOString().slice(0, 10)))
    );

    if (!missedDates.length) {
      return res.json({
        success: true,
        data: {
          missedDaysCount: 0,
          missedDates: [],
          recoverySprint: [],
          before: [],
          after: [],
        },
      });
    }

    const upcomingSchedules = await DailySchedule.find({
      userId: user._id,
      date: { $gte: today },
    })
      .sort({ date: 1 })
      .limit(3)
      .lean();

    const missedTasks = missedSchedules.flatMap((schedule) =>
      (schedule.tasks || []).filter((task) => !task.completed)
    );

    const topicIds = Array.from(new Set(missedTasks.map((task) => String(task.topicId))));
    const topics = topicIds.length
      ? await Topic.find({ _id: { $in: topicIds }, userId: user._id })
          .select("_id strength title")
          .lean()
      : [];

    const strengthRank = { weak: 3, normal: 2, strong: 1 };
    const topicMap = new Map(topics.map((topic) => [String(topic._id), topic]));

    const sprintTasks = missedTasks
      .map((task) => {
        const topic = topicMap.get(String(task.topicId));
        return {
          topicTitle: topic?.title || task.topicTitleSnapshot || "Topic",
          strength: topic?.strength || "normal",
        };
      })
      .sort((a, b) => strengthRank[b.strength] - strengthRank[a.strength])
      .slice(0, 2);

    const recoverySprint = sprintTasks.map((task, index) => ({
      topicTitle: task.topicTitle,
      minutes: index === 0 ? 25 : 15,
    }));

    const before = buildPreview(upcomingSchedules);
    const after = JSON.parse(JSON.stringify(before));

    if (after.length) {
      const missedTitles = missedTasks.map((task) => task.topicTitleSnapshot);
      after[0].tasks = [...missedTitles, ...after[0].tasks].slice(0, 6);
    }

    return res.json({
      success: true,
      data: {
        missedDaysCount: missedDates.length,
        missedDates,
        recoverySprint,
        before,
        after,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const applyRecoveryPlan = async (req, res, next) => {
  try {
    const user = req.user;
    const today = getTodayInTimeZone(user.timezone);

    const subjectIds = await DailySchedule.distinct("subjectId", {
      userId: user._id,
      date: { $lt: today },
      "tasks.completed": false,
    });

    for (const subjectId of subjectIds) {
      try {
        await recalculateSubjectSchedule({
          userId: user._id,
          subjectId,
          startDate: today,
          includeMissed: true,
        });
      } catch (error) {
        console.warn(`Recovery plan failed for subject ${subjectId}: ${error.message}`);
      }
    }

    return res.json({ success: true, data: { applied: true } });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRecoveryPreview,
  applyRecoveryPlan,
};