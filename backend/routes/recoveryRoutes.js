const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getRecoveryPreview, applyRecoveryPlan } = require("../controllers/recoveryController");

const router = express.Router();

router.use(authMiddleware);
router.get("/preview", getRecoveryPreview);
router.post("/apply", applyRecoveryPlan);

module.exports = router;