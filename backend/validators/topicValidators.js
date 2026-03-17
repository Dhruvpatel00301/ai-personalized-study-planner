const { body } = require("express-validator");

const createTopicValidation = [
  body("title").trim().notEmpty().withMessage("Topic title is required"),
  body("strength")
    .optional()
    .isIn(["weak", "normal", "strong"])
    .withMessage("Strength must be weak, normal, or strong"),
];

const updateTopicValidation = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("strength")
    .optional()
    .isIn(["weak", "normal", "strong"])
    .withMessage("Strength must be weak, normal, or strong"),
  body("isCompleted").optional().isBoolean(),
];

module.exports = {
  createTopicValidation,
  updateTopicValidation,
};
