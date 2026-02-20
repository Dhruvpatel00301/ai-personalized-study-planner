const { param } = require("express-validator");

const subjectIdParamValidation = [
  param("subjectId").isMongoId().withMessage("Invalid subject ID"),
];

module.exports = {
  subjectIdParamValidation,
};
