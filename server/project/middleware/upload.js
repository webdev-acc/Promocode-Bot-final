const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("Filtering file:", file.originalname, file.mimetype);
    if (
      !file.mimetype.startsWith("image/") &&
      file.mimetype !== "image/svg+xml"
    ) {
      return cb(new Error("Только изображения разрешены!"));
    }
    cb(null, true);
  },
});

module.exports = upload;
