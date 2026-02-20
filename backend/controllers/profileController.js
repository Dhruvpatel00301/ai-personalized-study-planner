const User = require("../models/User");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

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
        profileImageUrl: user.profileImageUrl,
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

module.exports = {
  updateProfile,
  updateProfileImage,
};
