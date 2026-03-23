const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { chatWithCoach, getCoachHistory, clearCoachHistory } = require("../controllers/coachController");

const router = express.Router();

router.use(authMiddleware);
router.get("/history", getCoachHistory);
router.delete("/history", clearCoachHistory);
router.post("/chat", chatWithCoach);

module.exports = router;