const Exam = require("../models/Exam");

const getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: exams });
  } catch (error) {
    return next(error);
  }
};

const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.examId, userId: req.user._id });
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    return res.json({ success: true, data: exam });
  } catch (error) {
    return next(error);
  }
};

const createExam = async (req, res, next) => {
  try {
    const { name, examDate, description } = req.body;
    const exam = await Exam.create({
      userId: req.user._id,
      name,
      examDate,
      description: description || "",
    });
    return res.status(201).json({ success: true, data: exam });
  } catch (error) {
    return next(error);
  }
};

const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.examId, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    return res.json({ success: true, data: exam });
  } catch (error) {
    return next(error);
  }
};

const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.examId, userId: req.user._id });
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    // cascade delete related subjects, topics, plans, schedules
    const Subject = require("../models/Subject");
    const Topic = require("../models/Topic");
    const StudyPlan = require("../models/StudyPlan");
    const DailySchedule = require("../models/DailySchedule");

    const subjects = await Subject.find({ examId: exam._id, userId: req.user._id }).select("_id");
    const subjectIds = subjects.map((s) => s._id);

    await Promise.all([
      Subject.deleteMany({ _id: { $in: subjectIds } }),
      Topic.deleteMany({ subjectId: { $in: subjectIds }, userId: req.user._id }),
      StudyPlan.deleteMany({ subjectId: { $in: subjectIds }, userId: req.user._id }),
      DailySchedule.deleteMany({ subjectId: { $in: subjectIds }, userId: req.user._id }),
    ]);

    return res.json({ success: true, message: "Exam deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
