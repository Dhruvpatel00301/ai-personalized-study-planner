const Subject = require("../models/Subject");
const Topic = require("../models/Topic");
const StudyPlan = require("../models/StudyPlan");
const DailySchedule = require("../models/DailySchedule");
const { buildSchedulePayload, calculateDaysLeft } = require("../utils/schedulerAlgorithm");
const { getTodayInTimeZone } = require("../utils/dateTime");

const upsertPlanRecord = async ({ userId, subjectId, startDate, examDate, status }) => {
  await StudyPlan.findOneAndUpdate(
    { userId, subjectId },
    {
      userId,
      subjectId,
      generatedAt: new Date(),
      startDate,
      examDate,
      status,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const recalculateSubjectSchedule = async ({ userId, subjectId, startDate, includeMissed = true }) => {
  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) {
    throw new Error("Subject not found");
  }

  const topics = await Topic.find({ userId, subjectId });
  if (!topics.length) {
    throw new Error("Add at least one topic before generating a study plan");
  }

  const missedTopicIds = [];
  let overdueScheduleIds = [];

  if (includeMissed) {
    const overdueSchedules = await DailySchedule.find({
      userId,
      subjectId,
      date: { $lt: startDate },
      "tasks.completed": false,
    }).select("_id tasks");

    overdueSchedules.forEach((schedule) => {
      schedule.tasks
        .filter((task) => !task.completed)
        .forEach((task) => missedTopicIds.push(task.topicId));
    });

    overdueScheduleIds = overdueSchedules.map((schedule) => schedule._id);
  }

  // Remove consumed overdue schedules so auto-recalculation does not loop on each dashboard load.
  if (includeMissed && overdueScheduleIds.length) {
    await DailySchedule.deleteMany({
      _id: { $in: overdueScheduleIds },
    });
  }

  await DailySchedule.deleteMany({
    userId,
    subjectId,
    date: { $gte: startDate },
  });

  const schedulePayload = buildSchedulePayload({
    userId,
    subject,
    topics,
    startDate,
    missedTopicIds,
  });

  if (schedulePayload.length) {
    await DailySchedule.insertMany(schedulePayload);
  }

  await upsertPlanRecord({
    userId,
    subjectId,
    startDate,
    examDate: subject.examDate,
    status: includeMissed ? "regenerated" : "active",
  });

  return {
    subject,
    totalDays: schedulePayload.length,
    missedTasksCarried: missedTopicIds.length,
    daysLeft: calculateDaysLeft(startDate, new Date(subject.examDate)),
  };
};

const generateStudyPlan = async (req, res, next) => {
  try {
    const startDate = getTodayInTimeZone(req.user.timezone);
    const result = await recalculateSubjectSchedule({
      userId: req.user._id,
      subjectId: req.params.subjectId,
      startDate,
      includeMissed: false,
    });

    return res.status(201).json({
      success: true,
      message: "Study plan generated",
      data: result,
    });
  } catch (error) {
    if (error.message.includes("Exam date already passed")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

const recalculateStudyPlan = async (req, res, next) => {
  try {
    const startDate = getTodayInTimeZone(req.user.timezone);
    const result = await recalculateSubjectSchedule({
      userId: req.user._id,
      subjectId: req.params.subjectId,
      startDate,
      includeMissed: true,
    });

    return res.json({
      success: true,
      message: "Study plan recalculated",
      data: result,
    });
  } catch (error) {
    if (error.message.includes("Exam date already passed")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

module.exports = {
  generateStudyPlan,
  recalculateStudyPlan,
  recalculateSubjectSchedule,
};
