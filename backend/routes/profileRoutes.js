const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { updateProfile, updateProfileImage } = require("../controllers/profileController");
const { uploadProfileImage } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.put("/", updateProfile);
router.post("/image", uploadProfileImage, updateProfileImage);

module.exports = router;
