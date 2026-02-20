const cron = require("node-cron");
const User = require("../models/User");
const DailySchedule = require("../models/DailySchedule");
const { sendEmail } = require("./emailService");
const { getMotivationalMessage } = require("./motivationalTemplates");
const { getTimePartsInTimeZone, dateFromYMD, toDateStringInTimeZone } = require("./dateTime");

const buildReminderHtml = ({ userName, pendingTasks, includeMotivation }) => {
  const taskItems = pendingTasks.length
    ? `<ul>${pendingTasks
        .map((task) => `<li>${task.topicTitleSnapshot} (${task.taskType})</li>`)
        .join("")}</ul>`
    : "<p>No pending tasks today. Keep your momentum strong.</p>";

  const motivation = includeMotivation ? `<p>${getMotivationalMessage()}</p>` : "";

  return `
    <div>
      <h2>Hi ${userName}, here is your study reminder</h2>
      <p>This is your daily study check-in at 7:00 PM local time.</p>
      ${taskItems}
      ${motivation}
    </div>
  `;
};

const shouldSendReminderNow = (user) => {
  const nowParts = getTimePartsInTimeZone(new Date(), user.timezone);
  const alreadySentToday =
    user.lastReminderSentDate &&
    toDateStringInTimeZone(new Date(user.lastReminderSentDate), user.timezone) === nowParts.ymd;

  // Cron runs every 15 minutes; this gate ensures one reminder at the configured local hour.
  return nowParts.hour === user.reminderHour && nowParts.minute < 15 && !alreadySentToday;
};

const sendReminderToUser = async (user) => {
  const nowParts = getTimePartsInTimeZone(new Date(), user.timezone);
  const today = dateFromYMD(nowParts.ymd);

  const [todaySchedules, missedExists] = await Promise.all([
    DailySchedule.find({ userId: user._id, date: today }),
    DailySchedule.exists({ userId: user._id, date: { $lt: today }, "tasks.completed": false }),
  ]);

  const pendingTasks = todaySchedules
    .flatMap((schedule) => schedule.tasks)
    .filter((task) => !task.completed);

  const html = buildReminderHtml({
    userName: user.name,
    pendingTasks,
    includeMotivation: Boolean(missedExists),
  });

  await sendEmail({
    to: user.email,
    subject: "AI Personalized Study Planner - Daily Reminder",
    html,
  });

  user.lastReminderSentDate = today;
  await user.save();
};

const initCronJobs = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const users = await User.find();

      for (const user of users) {
        if (!shouldSendReminderNow(user)) {
          continue;
        }

        try {
          await sendReminderToUser(user);
        } catch (error) {
          console.error(`Reminder send failed for user ${user.email}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error("Cron execution failed:", error.message);
    }
  });
};

module.exports = {
  initCronJobs,
};
