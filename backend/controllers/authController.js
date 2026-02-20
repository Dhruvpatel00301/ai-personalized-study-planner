const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          timezone: user.timezone,
          reminderHour: user.reminderHour,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          timezone: user.timezone,
          reminderHour: user.reminderHour,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  return res.json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      timezone: req.user.timezone,
      reminderHour: req.user.reminderHour,
      streakCurrent: req.user.streakCurrent,
      streakBest: req.user.streakBest,
    },
  });
};

module.exports = {
  register,
  login,
  me,
};
