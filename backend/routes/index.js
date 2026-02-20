const express = require("express");
const authRoutes = require("./authRoutes");
const subjectRoutes = require("./subjectRoutes");
const topicRoutes = require("./topicRoutes");
const studyPlanRoutes = require("./studyPlanRoutes");
const dailyScheduleRoutes = require("./dailyScheduleRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const profileRoutes = require("./profileRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

router.use("/auth", authRoutes);
router.use("/subjects", subjectRoutes);
router.use("/topics", topicRoutes);
router.use("/study-plan", studyPlanRoutes);
router.use("/daily-schedule", dailyScheduleRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/profile", profileRoutes);

module.exports = router;
