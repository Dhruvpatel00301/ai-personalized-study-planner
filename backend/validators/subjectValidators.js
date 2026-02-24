const { body } = require("express-validator");

const createSubjectValidation = [
  body("name").trim().notEmpty().withMessage("Subject name is required"),
  body("examId").notEmpty().withMessage("Exam ID is required"),
  body("description").optional().isString(),
];

const updateSubjectValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("examId").optional().notEmpty().withMessage("Exam ID cannot be empty"),
  body("description").optional().isString(),
  body("isArchived").optional().isBoolean(),
];

module.exports = {
  createSubjectValidation,
  updateSubjectValidation,
};
