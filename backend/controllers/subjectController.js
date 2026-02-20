const Subject = require("../models/Subject");
const Topic = require("../models/Topic");
const StudyPlan = require("../models/StudyPlan");
const DailySchedule = require("../models/DailySchedule");

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: subjects });
  } catch (error) {
    return next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, examDate, description } = req.body;
    const subject = await Subject.create({
      userId: req.user._id,
      name,
      examDate,
      description: description || "",
    });

    return res.status(201).json({ success: true, data: subject });
  } catch (error) {
    return next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.subjectId, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    return res.json({ success: true, data: subject });
  } catch (error) {
    return next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.subjectId, userId: req.user._id });

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    await Promise.all([
      Topic.deleteMany({ subjectId: subject._id, userId: req.user._id }),
      StudyPlan.deleteMany({ subjectId: subject._id, userId: req.user._id }),
      DailySchedule.deleteMany({ subjectId: subject._id, userId: req.user._id }),
    ]);

    return res.json({ success: true, message: "Subject deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
