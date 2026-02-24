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

// ensure a user cannot create two topics with the same title under the same subject
// use a case‑insensitive collation so "Loops" and "loops" collide
topicSchema.index(
  { userId: 1, subjectId: 1, title: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Topic", topicSchema);
