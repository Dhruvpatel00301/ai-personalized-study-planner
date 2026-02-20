const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const {
  getTopicsBySubject,
  createTopic,
  updateTopic,
  deleteTopic,
} = require("../controllers/topicController");
const { createTopicValidation, updateTopicValidation } = require("../validators/topicValidators");

const router = express.Router();

router.use(authMiddleware);
router.get("/:subjectId", getTopicsBySubject);
router.post("/:subjectId", createTopicValidation, validateMiddleware, createTopic);
router.put("/item/:topicId", updateTopicValidation, validateMiddleware, updateTopic);
router.delete("/item/:topicId", deleteTopic);

module.exports = router;
