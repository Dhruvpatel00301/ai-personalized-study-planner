const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { updateProfile } = require("../controllers/profileController");

const router = express.Router();

router.use(authMiddleware);
router.put("/", updateProfile);

module.exports = router;
