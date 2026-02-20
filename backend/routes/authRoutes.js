const express = require("express");
const { register, login, me } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const { registerValidation, loginValidation } = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerValidation, validateMiddleware, register);
router.post("/login", loginValidation, validateMiddleware, login);
router.get("/me", authMiddleware, me);

module.exports = router;
