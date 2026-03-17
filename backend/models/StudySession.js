const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
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
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
    durationSeconds: {
      type: Number,
      min: 1,
      required: true,
    },
    proofImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    proofImagePublicId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

studySessionSchema.index({ userId: 1, startedAt: 1 });

module.exports = mongoose.model("StudySession", studySessionSchema);
