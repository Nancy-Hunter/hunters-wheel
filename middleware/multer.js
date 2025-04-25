const multer = require("multer");
const path = require("path");

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/pjpeg"];
    let ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    const isExtAllowed = allowedExtensions.includes(ext);
    const isMimeAllowed = allowedMimeTypes.includes(mime);

    if (!isExtAllowed || !isMimeAllowed) {
      return cb(new Error("File type is not supported"), false);
    }

    cb(null, true);
  },
});
