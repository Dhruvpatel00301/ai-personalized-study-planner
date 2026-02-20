const { body } = require("express-validator");

const createTopicValidation = [
  body("title").trim().notEmpty().withMessage("Topic title is required"),
  body("strength")
    .optional()
    .isIn(["weak", "normal", "strong"])
    .withMessage("Strength must be weak, normal, or strong"),
  body("estimatedMinutes")
    .optional()
    .isInt({ min: 10 })
    .withMessage("Estimated minutes must be at least 10"),
];

const updateTopicValidation = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("strength")
    .optional()
    .isIn(["weak", "normal", "strong"])
    .withMessage("Strength must be weak, normal, or strong"),
  body("estimatedMinutes")
    .optional()
    .isInt({ min: 10 })
    .withMessage("Estimated minutes must be at least 10"),
  body("isCompleted").optional().isBoolean(),
];

module.exports = {
  createTopicValidation,
  updateTopicValidation,
};
