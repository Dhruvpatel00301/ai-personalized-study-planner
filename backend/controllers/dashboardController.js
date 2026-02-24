const DailySchedule = require("../models/DailySchedule");
const Subject = require("../models/Subject");
const Topic = require("../models/Topic");
const User = require("../models/User");
const StudyPlan = require("../models/StudyPlan");
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
      DailySchedule.find({ userId: user._id, date: today }).lean(),
      DailySchedule.find({ userId: user._id }),
      Subject.countDocuments({ userId: user._id, isArchived: false }),
      Topic.find({ userId: user._id }).select("_id strength").lean(),
    ]);

    const subjectIds = todaySchedules.map((schedule) => schedule.subjectId).filter(Boolean);

    const uniqueSubjectIds = Array.from(new Set(subjectIds.map((id) => String(id))));

    const [subjectDocs, studyPlanDocs] = uniqueSubjectIds.length
      ? await Promise.all([
          Subject.find({ _id: { $in: uniqueSubjectIds }, userId: user._id })
            .select("_id name examId")
            .populate("examId", "name")
            .lean(),
          StudyPlan.find({
            userId: user._id,
            subjectId: { $in: uniqueSubjectIds },
            examId: { $ne: null },
          })
            .sort({ generatedAt: -1 })
            .select("subjectId examId generatedAt")
            .populate("examId", "name")
            .lean(),
        ])
      : [[], []];

    const studyPlanExamMap = new Map();
    studyPlanDocs.forEach((plan) => {
      const key = String(plan.subjectId);
      if (!studyPlanExamMap.has(key)) {
        studyPlanExamMap.set(key, {
          examName: plan.examId?.name || "No Exam",
          examId: plan.examId?._id ? String(plan.examId._id) : null,
        });
      }
    });

    const subjectsToBackfill = [];

    const subjectMetaMap = new Map(
      subjectDocs.map((subject) => {
        const planFallback = studyPlanExamMap.get(String(subject._id));
        const resolvedExamId = subject.examId?._id
          ? String(subject.examId._id)
          : planFallback?.examId || null;
        const resolvedExamName = subject.examId?.name || planFallback?.examName || "No Exam";

        // Keep records consistent once we can infer exam linkage.
        if (!subject.examId?._id && resolvedExamId) {
          subjectsToBackfill.push({
            updateOne: {
              filter: { _id: subject._id, userId: user._id, examId: null },
              update: { $set: { examId: resolvedExamId } },
            },
          });
        }

        return [
          String(subject._id),
          {
            subjectName: subject.name || "Subject",
            examName: resolvedExamName,
            examId: resolvedExamId,
          },
        ];
      })
    );

    if (subjectsToBackfill.length) {
      await Subject.bulkWrite(subjectsToBackfill, { ordered: false });
    }

    const scheduleExamMetaMap = new Map();
    const scheduleExamBackfills = [];

    todaySchedules.forEach((schedule) => {
      const subjectId = schedule.subjectId ? String(schedule.subjectId) : null;
      const subjectMeta = subjectId ? subjectMetaMap.get(subjectId) : null;
      const planFallback = subjectId ? studyPlanExamMap.get(subjectId) : null;

      const resolvedExamName =
        subjectMeta?.examName || planFallback?.examName || schedule.examNameSnapshot || "No Exam";
      const resolvedExamId =
        subjectMeta?.examId ||
        planFallback?.examId ||
        (schedule.examId ? String(schedule.examId) : null);

      scheduleExamMetaMap.set(String(schedule._id), {
        examName: resolvedExamName,
        examId: resolvedExamId,
      });

      if (
        resolvedExamName !== "No Exam" &&
        (!schedule.examId || schedule.examNameSnapshot !== resolvedExamName)
      ) {
        scheduleExamBackfills.push({
          updateOne: {
            filter: { _id: schedule._id, userId: user._id },
            update: {
              $set: {
                examId: resolvedExamId,
                examNameSnapshot: resolvedExamName,
              },
            },
          },
        });
      }
    });

    if (scheduleExamBackfills.length) {
      await DailySchedule.bulkWrite(scheduleExamBackfills, { ordered: false });
    }

    // build a map of topicId -> strength for quick lookup
    const topicStrengthMap = {};
    topicsMap.forEach((topic) => {
      topicStrengthMap[String(topic._id)] = topic.strength || "normal";
    });

    const todayTasks = todaySchedules.flatMap((schedule) =>
      schedule.tasks.map((task) => {
        const subjectId = schedule.subjectId ? String(schedule.subjectId) : null;
        const scheduleExamMeta = scheduleExamMetaMap.get(String(schedule._id));
        const subjectMeta = subjectId ? subjectMetaMap.get(subjectId) : null;

        return {
          taskId: task._id,
          scheduleId: schedule._id,
          subjectName: subjectMeta?.subjectName || "Subject",
          subjectId,
          examName: scheduleExamMeta?.examName || "No Exam",
          examId: scheduleExamMeta?.examId || null,
          topicTitle: task.topicTitleSnapshot,
          topicId: task.topicId,
          taskType: task.taskType,
          completed: task.completed,
          strength: topicStrengthMap[String(task.topicId)] || "normal",
        };
      })
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
