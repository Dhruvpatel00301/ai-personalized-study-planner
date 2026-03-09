const DailySchedule = require("../models/DailySchedule");
const Topic = require("../models/Topic");
const User = require("../models/User");
const computeReadinessScore = require("../utils/readinessScore");

const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value)));

const computeConceptScore = (schedules, topicStrengthMap) => {
  const strengthWeights = { weak: 1.4, normal: 1, strong: 0.85 };

  let weightedTotal = 0;
  let weightedCompleted = 0;

  schedules.forEach((schedule) => {
    schedule.tasks.forEach((task) => {
      const strength = topicStrengthMap.get(String(task.topicId)) || "normal";
      const weight = strengthWeights[strength] || strengthWeights.normal;
      weightedTotal += weight;
      if (task.completed) {
        weightedCompleted += weight;
      }
    });
  });

  if (!weightedTotal) return 0;
  return clampPercent((weightedCompleted / weightedTotal) * 100);
};

const computePracticeScore = (completion, revisionTotal, revisionCompleted) => {
  if (!revisionTotal) {
    return completion;
  }

  const revisionCompletion = (revisionCompleted / revisionTotal) * 100;
  return clampPercent(completion * 0.7 + revisionCompletion * 0.3);
};

const computeConsistencyScore = (streakConsistency, groupedByDate) => {
  const dayBuckets = Array.from(groupedByDate.values());
  if (!dayBuckets.length) {
    return 0;
  }

  const daysWithAnyCompletion = dayBuckets.filter((day) => day.completed > 0).length;
  const fullyCompletedDays = dayBuckets.filter((day) => day.total > 0 && day.completed === day.total).length;

  const dailyEngagement = (daysWithAnyCompletion / dayBuckets.length) * 100;
  const dayCompletionDiscipline = (fullyCompletedDays / dayBuckets.length) * 100;

  return clampPercent(
    streakConsistency * 0.6 + dailyEngagement * 0.25 + dayCompletionDiscipline * 0.15
  );
};

const getAnalyticsOverview = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const schedules = await DailySchedule.find({ userId: req.user._id }).sort({ date: 1 });

    const groupedByDate = new Map();
    const topicIds = new Set();

    schedules.forEach((schedule) => {
      const key = schedule.date.toISOString().slice(0, 10);
      if (!groupedByDate.has(key)) {
        groupedByDate.set(key, { total: 0, completed: 0 });
      }

      const bucket = groupedByDate.get(key);
      schedule.tasks.forEach((task) => {
        bucket.total += 1;
        if (task.completed) {
          bucket.completed += 1;
        }
        topicIds.add(String(task.topicId));
      });
    });

    const topicDocs = await Topic.find({
      userId: req.user._id,
      _id: { $in: Array.from(topicIds) },
    }).select("_id strength");

    const topicStrengthMap = new Map(topicDocs.map((topic) => [String(topic._id), topic.strength]));

    let totalTasks = 0;
    let completedTasks = 0;
    let weakTotal = 0;
    let weakCompleted = 0;
    let revisionTotal = 0;
    let revisionCompleted = 0;

    schedules.forEach((schedule) => {
      schedule.tasks.forEach((task) => {
        totalTasks += 1;
        if (task.completed) {
          completedTasks += 1;
        }

        if (task.taskType === "revision") {
          revisionTotal += 1;
          if (task.completed) {
            revisionCompleted += 1;
          }
        }

        if (topicStrengthMap.get(String(task.topicId)) === "weak") {
          weakTotal += 1;
          if (task.completed) {
            weakCompleted += 1;
          }
        }
      });
    });

    const completion = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const weakCoverage = weakTotal ? Math.round((weakCompleted / weakTotal) * 100) : 0;

    const activeDays = Math.max(1, groupedByDate.size);
    const streakConsistency = Math.min(100, Math.round((user.streakCurrent / activeDays) * 100));
    const conceptScore = computeConceptScore(schedules, topicStrengthMap);
    const practiceScore = computePracticeScore(completion, revisionTotal, revisionCompleted);
    const consistencyScore = computeConsistencyScore(streakConsistency, groupedByDate);

    const readiness = computeReadinessScore({
      concept: conceptScore,
      practice: practiceScore,
      consistency: consistencyScore,
    });

    const lineChart = Array.from(groupedByDate.entries()).map(([date, value]) => ({
      date,
      progressPercent: value.total ? Math.round((value.completed / value.total) * 100) : 0,
    }));

    const pieChart = {
      weakCompleted,
      weakPending: Math.max(0, weakTotal - weakCompleted),
      weakCoverage,
    };

    return res.json({
      success: true,
      data: {
        readiness,
        confidenceMeter: {
          concept: conceptScore,
          practice: practiceScore,
          consistency: consistencyScore,
        },
        metrics: {
          completion,
          weakCoverage,
          streakConsistency,
        },
        lineChart,
        pieChart,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAnalyticsOverview,
};
