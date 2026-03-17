const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadSessionProof } = require("../middlewares/uploadMiddleware");
const { saveStudySession, updateStudySessionProof } = require("../controllers/studySessionController");

const router = express.Router();

router.use(authMiddleware);
router.post("/", uploadSessionProof, saveStudySession);
router.patch("/:sessionId/proof", uploadSessionProof, updateStudySessionProof);

module.exports = router;
