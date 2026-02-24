const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const {
  createSubjectValidation,
  updateSubjectValidation,
} = require("../validators/subjectValidators");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getSubjects);
router.get("/:subjectId", getSubjectById);
router.post("/", createSubjectValidation, validateMiddleware, createSubject);
router.put("/:subjectId", updateSubjectValidation, validateMiddleware, updateSubject);
router.delete("/:subjectId", deleteSubject);

module.exports = router;
