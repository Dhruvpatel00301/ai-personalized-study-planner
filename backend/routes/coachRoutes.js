const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { chatWithCoach } = require("../controllers/coachController");

const router = express.Router();

router.use(authMiddleware);
router.post("/chat", chatWithCoach);

module.exports = router;
