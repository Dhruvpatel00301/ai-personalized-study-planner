const Subject = require("../models/Subject");
const Topic = require("../models/Topic");

const getTopicsBySubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    const topics = await Topic.find({ subjectId: subject._id, userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: topics });
  } catch (error) {
    return next(error);
  }
};

const createTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    const topic = await Topic.create({
      userId: req.user._id,
      subjectId: subject._id,
      title: req.body.title,
      strength: req.body.strength || "normal",
      estimatedMinutes: req.body.estimatedMinutes || 45,
    });

    return res.status(201).json({ success: true, data: topic });
  } catch (error) {
    return next(error);
  }
};

const updateTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.topicId, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    return res.json({ success: true, data: topic });
  } catch (error) {
    return next(error);
  }
};

const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.topicId, userId: req.user._id });
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    return res.json({ success: true, message: "Topic deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTopicsBySubject,
  createTopic,
  updateTopic,
  deleteTopic,
};
