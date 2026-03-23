const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { chatWithCoach, getCoachHistory } = require("../controllers/coachController");

const router = express.Router();

router.use(authMiddleware);
router.get("/history", getCoachHistory);
router.post("/chat", chatWithCoach);

module.exports = router;
