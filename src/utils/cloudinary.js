const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dst0ze0zy",
  api_key: "191775259646261",
  api_secret: "UGaYVTXz-t164vgm8gJdodU9lXw",
});
async function fileUploadcow(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    folder: "vacas",
  });
}

async function deleteImage(publicId) {
  return await cloudinary.uploader.destroy(publicId);
}

module.exports = {fileUploadcow, deleteImage};
