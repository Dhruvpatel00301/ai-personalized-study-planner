const DailySchedule = require("../models/DailySchedule");
const Topic = require("../models/Topic");
const Subject = require("../models/Subject");
const { getTodayInTimeZone } = require("../utils/dateTime");
const OpenAI = require("openai");

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const requestGroqChat = async (messages) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages,
      max_completion_tokens: 250,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    const error = new Error(`Groq API error ${response.status}: ${bodyText}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim();
};

const buildTodaySummary = async (user) => {
  const today = getTodayInTimeZone(user.timezone);
  const schedules = await DailySchedule.find({ userId: user._id, date: today }).lean();
  const tasks = schedules.flatMap((s) => s.tasks || []);
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;

  return {
    date: today.toISOString().slice(0, 10),
    total: tasks.length,
    completed,
    pending,
  };
};

const buildWeakTopics = async (user) => {
  const weakTopics = await Topic.find({ userId: user._id, strength: "weak" })
    .select("_id title subjectId")
    .lean();

  if (!weakTopics.length) {
    return [];
  }

  const subjectIds = Array.from(new Set(weakTopics.map((t) => String(t.subjectId))));
  const subjects = await Subject.find({ _id: { $in: subjectIds }, userId: user._id })
    .select("_id name")
    .lean();
  const subjectMap = new Map(subjects.map((s) => [String(s._id), s.name]));

  return weakTopics.slice(0, 5).map((topic) => ({
    title: topic.title,
    subject: subjectMap.get(String(topic.subjectId)) || "Subject",
  }));
};

const respondToMessage = async (user, message) => {
  const text = (message || "").toLowerCase();
  const todaySummary = await buildTodaySummary(user);
  const weakTopics = await buildWeakTopics(user);

  if (!message || message.trim().length === 0) {
    return "Ask me about today's tasks, weak topics, or your study plan.";
  }

  if (!openai && !groqApiKey) {
    if (text.includes("today")) {
      if (todaySummary.total === 0) {
        return "You have no tasks scheduled for today. Generate a plan to get started.";
      }
      return `Today (${todaySummary.date}) you have ${todaySummary.total} tasks: ${todaySummary.completed} done, ${todaySummary.pending} pending.`;
    }

    if (text.includes("weak")) {
      if (!weakTopics.length) {
        return "Great news - you have no weak topics right now.";
      }
      const list = weakTopics.map((t) => `${t.title} (${t.subject})`).join(", ");
      return `Focus these weak topics next: ${list}.`;
    }

    if (text.includes("plan") || text.includes("schedule")) {
      if (todaySummary.total === 0) {
        return "You don't have a schedule yet. Add subjects and topics, then generate a plan.";
      }
      return "Stick to today's tasks first, then review weak topics. If you miss a day, recalculate your plan.";
    }

    return "I can help with today's tasks, weak topics, or study plan. Try: \"What should I study today?\"";
  }

  const contextLines = [
    `Date: ${todaySummary.date}`,
    `Tasks today: ${todaySummary.total}, completed: ${todaySummary.completed}, pending: ${todaySummary.pending}`,
    `Weak topics: ${
      weakTopics.length
        ? weakTopics.map((t) => `${t.title} (${t.subject})`).join(", ")
        : "none"
    }`,
  ];

  const system = [
    "You are the Study Coach for a student.",
    "Only answer questions about the student's study plan, tasks, or weak topics.",
    "Be concise, practical, and encouraging. If the user asks outside scope, redirect them back to their plan.",
  ].join(" ");

  if (groqApiKey) {
    try {
      const content = await requestGroqChat([
        { role: "system", content: system },
        { role: "user", content: `Context:\n${contextLines.join("\n")}\n\nUser: ${message}` },
      ]);

      return content || "I can help with today's tasks or weak topics.";
    } catch (error) {
      const status = error?.status;
      const messageText = error?.message || "";

      console.error("Study Coach Groq error:", status, messageText);

      if (status === 401) {
        return "The coach couldn't authenticate. Please check your GROQ_API_KEY.";
      }
      if (status === 429) {
        return "The coach is rate-limited or out of free-tier credits. Please try again later.";
      }
      if (status === 404 || messageText.toLowerCase().includes("model")) {
        return "The coach model isn't available. Try setting GROQ_MODEL to a supported Groq model.";
      }

      return "I had trouble reaching the coach right now. Try again in a moment.";
    }
  }

  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: [
        { role: "system", content: system },
        { role: "user", content: `Context:\n${contextLines.join("\n")}\n\nUser: ${message}` },
      ],
      max_output_tokens: 250,
    });

    return response.output_text?.trim() || "I can help with today's tasks or weak topics.";
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const messageText = error?.message || "";

    console.error("Study Coach OpenAI error:", status, messageText);

    if (status === 401) {
      return "The coach couldn't authenticate. Please check your OPENAI_API_KEY.";
    }
    if (status === 429) {
      return "The coach is rate-limited or out of credits. Please try again soon.";
    }
    if (status === 404 || messageText.toLowerCase().includes("model")) {
      return "The coach model isn't available. Try setting OPENAI_MODEL to a model you have access to.";
    }

    return "I had trouble reaching the coach right now. Try again in a moment.";
  }
};

const chatWithCoach = async (req, res, next) => {
  try {
    const { message } = req.body;
    const reply = await respondToMessage(req.user, message);
    return res.json({ success: true, data: { reply } });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  chatWithCoach,
};
