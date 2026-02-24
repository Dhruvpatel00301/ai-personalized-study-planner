const DailySchedule = require("../models/DailySchedule");
const User = require("../models/User");
const Subject = require("../models/Subject");
const StudyPlan = require("../models/StudyPlan");
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
    }).lean();

    const subjectIds = schedules.map((schedule) => schedule.subjectId).filter(Boolean);

    const uniqueSubjectIds = Array.from(new Set(subjectIds.map((id) => String(id))));

    const [subjectDocs, studyPlanDocs] = uniqueSubjectIds.length
      ? await Promise.all([
          Subject.find({ _id: { $in: uniqueSubjectIds }, userId: req.user._id })
            .select("_id name examId")
            .populate("examId", "name")
            .lean(),
          StudyPlan.find({
            userId: req.user._id,
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

        if (!subject.examId?._id && resolvedExamId) {
          subjectsToBackfill.push({
            updateOne: {
              filter: { _id: subject._id, userId: req.user._id, examId: null },
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

    schedules.forEach((schedule) => {
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
            filter: { _id: schedule._id, userId: req.user._id },
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

    const todayTasks = schedules.flatMap((schedule) =>
      schedule.tasks.map((task) => {
        const subjectId = schedule.subjectId ? String(schedule.subjectId) : null;
        const subjectMeta = subjectId ? subjectMetaMap.get(subjectId) : null;
        const scheduleExamMeta = scheduleExamMetaMap.get(String(schedule._id));

        return {
          taskId: task._id,
          scheduleId: schedule._id,
          subjectId,
          subjectName: subjectMeta?.subjectName || "Subject",
          examName: scheduleExamMeta?.examName || "No Exam",
          examId: scheduleExamMeta?.examId || null,
          topicTitle: task.topicTitleSnapshot,
          taskType: task.taskType,
          completed: task.completed,
        };
      })
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
