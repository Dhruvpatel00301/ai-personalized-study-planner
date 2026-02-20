const cloudinary = require("cloudinary").v2;

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadBufferToCloudinary = async (fileBuffer, mimeType, folder = "study-planner/profiles") => {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const base64 = fileBuffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;

  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

module.exports = {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};

