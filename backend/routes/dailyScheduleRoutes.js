const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getTodaySchedule, markTaskComplete } = require("../controllers/dailyScheduleController");

const router = express.Router();

router.use(authMiddleware);
router.get("/today", getTodaySchedule);
router.patch("/:taskId/complete", markTaskComplete);

module.exports = router;
