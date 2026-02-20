const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getAnalyticsOverview } = require("../controllers/analyticsController");

const router = express.Router();

router.use(authMiddleware);
router.get("/overview", getAnalyticsOverview);

module.exports = router;
