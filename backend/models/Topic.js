const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    strength: {
      type: String,
      enum: ["weak", "normal", "strong"],
      default: "normal",
    },
    estimatedMinutes: {
      type: Number,
      default: 45,
      min: 10,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
