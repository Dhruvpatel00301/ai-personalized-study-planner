const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController");
const {
  createExamValidation,
  updateExamValidation,
} = require("../validators/examValidators");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getExams);
router.get("/:examId", getExamById);
router.post("/", createExamValidation, validateMiddleware, createExam);
router.put("/:examId", updateExamValidation, validateMiddleware, updateExam);
router.delete("/:examId", deleteExam);

module.exports = router;
