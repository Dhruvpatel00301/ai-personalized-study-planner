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
    profileImageUrl: {
      type: String,
      default: "",
    },
    profileImagePublicId: {
      type: String,
      default: "",
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
    dailyTargetMinutes: {
      type: Number,
      default: 60,
      min: 5,
      max: 600,
    },
    weeklyTargetHours: {
      type: Number,
      default: 6,
      min: 1,
      max: 80,
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
    coachHistory: {
      type: [
        {
          role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
          },
          text: {
            type: String,
            required: true,
            trim: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);