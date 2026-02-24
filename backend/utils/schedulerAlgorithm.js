const WEIGHT_MAP = {
  weak: 1.5,
  normal: 1,
  strong: 0.8,
};

const dateToUTCMidnight = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addDaysUTC = (date, days) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

const daysBetweenInclusive = (startDate, endDate) => {
  const start = dateToUTCMidnight(startDate).getTime();
  const end = dateToUTCMidnight(endDate).getTime();
  const diff = Math.floor((end - start) / (24 * 60 * 60 * 1000));
  return diff + 1;
};

const getDateRange = (startDate, endDate) => {
  const totalDays = daysBetweenInclusive(startDate, endDate);
  return Array.from({ length: totalDays }, (_, index) => addDaysUTC(startDate, index));
};

const collectRevisionTasks = (history, maxTasks = 3) => {
  const map = new Map();

  for (const dayTasks of history) {
    for (const task of dayTasks) {
      if (!map.has(String(task.topicId))) {
        map.set(String(task.topicId), {
          topicId: task.topicId,
          topicTitleSnapshot: task.topicTitleSnapshot,
          taskType: "revision",
          completed: false,
          completedAt: null,
        });
      }
    }
  }

  return Array.from(map.values()).slice(0, maxTasks);
};

const buildWeightedQueue = (topics, nonRevisionDays, missedTopicIds = []) => {
  if (!topics.length) {
    return [];
  }

  const avgUnits = Math.max(1, Math.round(nonRevisionDays / topics.length));
  const missedMap = new Map();

  missedTopicIds.forEach((topicId) => {
    const key = String(topicId);
    missedMap.set(key, (missedMap.get(key) || 0) + 1);
  });

  const queue = [];

  for (const topic of topics) {
    const key = String(topic._id);
    const baseUnits = Math.max(
      1,
      Math.round((WEIGHT_MAP[topic.strength] || WEIGHT_MAP.normal) * avgUnits)
    );
    const missedUnits = missedMap.get(key) || 0;
    const totalUnits = baseUnits + missedUnits;

    for (let i = 0; i < totalUnits; i += 1) {
      queue.push(topic);
    }
  }

  queue.sort((a, b) => (WEIGHT_MAP[b.strength] || 1) - (WEIGHT_MAP[a.strength] || 1));
  return queue;
};

const calculateDaysLeft = (startDate, examDate) =>
  Math.max(0, daysBetweenInclusive(startDate, examDate));

const buildSchedulePayload = ({
  userId,
  subject,
  topics,
  startDate,
  missedTopicIds = [],
}) => {
  // subject is expected to have its exam populated (subject.examId)
  const examDateVal = subject.examId ? subject.examId.examDate : subject.examDate;
  const examDate = dateToUTCMidnight(new Date(examDateVal));
  const start = dateToUTCMidnight(new Date(startDate));

  if (examDate < start) {
    throw new Error("Exam date already passed for this subject.");
  }

  const days = getDateRange(start, examDate);
  const nonRevisionDays = days.filter((_, index) => (index + 1) % 5 !== 0).length;
  const weightedQueue = buildWeightedQueue(topics, nonRevisionDays, missedTopicIds);

  if (!weightedQueue.length) {
    throw new Error("No topics available to create a schedule.");
  }

  // Keep daily load balanced by distributing weighted topic units across all study days.
  const tasksPerStudyDay = Math.max(1, Math.ceil(weightedQueue.length / Math.max(1, nonRevisionDays)));
  let queuePointer = 0;
  const history = [];

  return days.map((day, index) => {
    const isRevisionDay = (index + 1) % 5 === 0;
    const tasks = [];

    if (isRevisionDay) {
      // Every 5th day becomes revision-focused, based on the previous 4 study days.
      const revisionTasks = collectRevisionTasks(history.slice(-4), 3);
      if (revisionTasks.length) {
        tasks.push(...revisionTasks);
      } else {
        const fallbackTopic = weightedQueue[queuePointer % weightedQueue.length];
        queuePointer += 1;
        tasks.push({
          topicId: fallbackTopic._id,
          topicTitleSnapshot: fallbackTopic.title,
          taskType: "revision",
          completed: false,
          completedAt: null,
        });
      }
    } else {
      for (let i = 0; i < tasksPerStudyDay; i += 1) {
        const topic = weightedQueue[queuePointer % weightedQueue.length];
        queuePointer += 1;

        tasks.push({
          topicId: topic._id,
          topicTitleSnapshot: topic.title,
          taskType: "study",
          completed: false,
          completedAt: null,
        });
      }
    }

    // ensure we don't accidentally schedule the same topic twice on the
    // same calendar day (study+revision or duplicate queue entries).
    // keep the first instance and discard later ones.
    const seen = new Set();
    const uniqueTasks = tasks.filter((t) => {
      const key = String(t.topicId);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    history.push(uniqueTasks);

    return {
      userId,
      subjectId: subject._id,
      examId: subject.examId?._id || null,
      examNameSnapshot: subject.examId?.name || "No Exam",
      date: day,
      tasks: uniqueTasks,
      completionPercent: 0,
    };
  });
};

module.exports = {
  WEIGHT_MAP,
  calculateDaysLeft,
  buildSchedulePayload,
};
