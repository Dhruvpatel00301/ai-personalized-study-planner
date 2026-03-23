const User = require("../models/User");
const StudySession = require("../models/StudySession");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const { toDateStringInTimeZone, dateFromYMD } = require("../utils/dateTime");

const isValidTimezone = (timezone) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, timezone, reminderHour, dailyTargetMinutes, weeklyTargetHours } = req.body;
    const user = await User.findById(req.user._id);

    if (name) {
      user.name = name;
    }

    if (timezone) {
      if (!isValidTimezone(timezone)) {
        return res.status(400).json({ success: false, message: "Invalid timezone" });
      }
      user.timezone = timezone;
    }

    if (reminderHour !== undefined) {
      if (Number.isNaN(Number(reminderHour)) || reminderHour < 0 || reminderHour > 23) {
        return res.status(400).json({ success: false, message: "Reminder hour must be between 0 and 23" });
      }
      user.reminderHour = Number(reminderHour);
    }

    if (dailyTargetMinutes !== undefined) {
      const daily = Number(dailyTargetMinutes);
      if (Number.isNaN(daily) || daily < 5 || daily > 600) {
        return res.status(400).json({ success: false, message: "Daily target must be between 5 and 600 minutes" });
      }
      user.dailyTargetMinutes = daily;
    }

    if (weeklyTargetHours !== undefined) {
      const weekly = Number(weeklyTargetHours);
      if (Number.isNaN(weekly) || weekly < 1 || weekly > 80) {
        return res.status(400).json({ success: false, message: "Weekly target must be between 1 and 80 hours" });
      }
      user.weeklyTargetHours = weekly;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        timezone: user.timezone,
        reminderHour: user.reminderHour,
        dailyTargetMinutes: user.dailyTargetMinutes,
        weeklyTargetHours: user.weeklyTargetHours,
        streakCurrent: user.streakCurrent,
        streakBest: user.streakBest,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Profile image is required" });
    }

    const user = await User.findById(req.user._id);

    const uploaded = await uploadBufferToCloudinary(req.file.buffer, req.file.mimetype);

    await deleteFromCloudinary(user.profileImagePublicId);

    user.profileImageUrl = uploaded.secure_url;
    user.profileImagePublicId = uploaded.public_id;
    await user.save();

    return res.json({
      success: true,
      message: "Profile image updated",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getWeekStartDate = (timezone) => {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" }).format(now);
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayIndex = map[weekday] ?? 0;
  const daysFromMonday = (dayIndex + 6) % 7;
  const todayYmd = toDateStringInTimeZone(now, timezone);
  const todayDate = dateFromYMD(todayYmd);
  return new Date(todayDate.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
};

const getGoalProgress = async (req, res, next) => {
  try {
    const user = req.user;
    const todayYmd = toDateStringInTimeZone(new Date(), user.timezone);
    const todayStart = dateFromYMD(todayYmd);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    const weekStart = getWeekStartDate(user.timezone);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

    const [todaySessions, weekSessions] = await Promise.all([
      StudySession.find({
        userId: user._id,
        startedAt: { $gte: todayStart, $lte: todayEnd },
      })
        .select("durationSeconds topicId")
        .populate("topicId", "title"),
      StudySession.find({
        userId: user._id,
        startedAt: { $gte: weekStart, $lte: weekEnd },
      }).select("durationSeconds"),
    ]);

    const dailySeconds = todaySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    const weeklySeconds = weekSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

    const topicTotals = todaySessions.reduce((acc, session) => {
      const topicTitle = session.topicId?.title || "Topic";
      acc[topicTitle] = (acc[topicTitle] || 0) + (session.durationSeconds || 0);
      return acc;
    }, {});

    const topicBreakdown = Object.entries(topicTotals)
      .map(([topicTitle, seconds]) => ({
        topicTitle,
        minutes: Math.round(seconds / 60),
      }))
      .sort((a, b) => b.minutes - a.minutes);

    return res.json({
      success: true,
      data: {
        dailyMinutes: Math.round(dailySeconds / 60),
        weeklyMinutes: Math.round(weeklySeconds / 60),
        dailyTargetMinutes: user.dailyTargetMinutes,
        weeklyTargetHours: user.weeklyTargetHours,
        todayTopicBreakdown: topicBreakdown,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  updateProfile,
  updateProfileImage,
  getGoalProgress,
};