const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const {
  getSubjects,
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
router.post("/", createSubjectValidation, validateMiddleware, createSubject);
router.put("/:subjectId", updateSubjectValidation, validateMiddleware, updateSubject);
router.delete("/:subjectId", deleteSubject);

module.exports = router;
