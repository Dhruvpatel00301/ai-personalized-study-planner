const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      default: "America/New_York",
    },
    reminderHour: {
      type: Number,
      default: 19,
      min: 0,
      max: 23,
    },
    streakCurrent: {
      type: Number,
      default: 0,
    },
    streakBest: {
      type: Number,
      default: 0,
    },
    lastCompletionDate: {
      type: Date,
      default: null,
    },
    lastReminderSentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
