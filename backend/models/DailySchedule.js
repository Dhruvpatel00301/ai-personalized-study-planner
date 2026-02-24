const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    topicTitleSnapshot: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      enum: ["study", "revision"],
      default: "study",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const dailyScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      default: null,
      index: true,
    },
    examNameSnapshot: {
      type: String,
      default: "No Exam",
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    tasks: {
      type: [taskSchema],
      default: [],
    },
    completionPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

dailyScheduleSchema.index({ userId: 1, subjectId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailySchedule", dailyScheduleSchema);
