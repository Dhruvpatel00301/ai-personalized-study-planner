const User = require("../models/User");

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
    const { name, timezone, reminderHour } = req.body;
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

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        reminderHour: user.reminderHour,
        streakCurrent: user.streakCurrent,
        streakBest: user.streakBest,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  updateProfile,
};
