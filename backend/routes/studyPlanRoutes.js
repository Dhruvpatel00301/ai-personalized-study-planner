const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const {
  generateStudyPlan,
  recalculateStudyPlan,
} = require("../controllers/studyPlanController");
const { subjectIdParamValidation } = require("../validators/studyPlanValidators");

const router = express.Router();

router.use(authMiddleware);
router.post("/generate/:subjectId", subjectIdParamValidation, validateMiddleware, generateStudyPlan);
router.post("/recalculate/:subjectId", subjectIdParamValidation, validateMiddleware, recalculateStudyPlan);

module.exports = router;
