const { body } = require("express-validator");

const createSubjectValidation = [
  body("name").trim().notEmpty().withMessage("Subject name is required"),
  body("examDate").isISO8601().withMessage("Valid exam date is required"),
  body("description").optional().isString(),
];

const updateSubjectValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("examDate").optional().isISO8601().withMessage("Exam date must be valid"),
  body("description").optional().isString(),
  body("isArchived").optional().isBoolean(),
];

module.exports = {
  createSubjectValidation,
  updateSubjectValidation,
};
