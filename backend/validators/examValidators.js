const { body } = require("express-validator");

const createExamValidation = [
  body("name").trim().notEmpty().withMessage("Exam name is required"),
  body("examDate").isISO8601().withMessage("Valid exam date is required"),
  body("description").optional().isString(),
];

const updateExamValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("examDate").optional().isISO8601().withMessage("Exam date must be valid"),
  body("description").optional().isString(),
  body("isArchived").optional().isBoolean(),
];

module.exports = {
  createExamValidation,
  updateExamValidation,
};
