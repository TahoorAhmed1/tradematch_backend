const path = require("path");
const multer = require("multer");

const { badRequestResponse } = require("@/constants/responses");

const storage = multer.memoryStorage();
const limits = { fileSize: 10 * 1024 * 1024 }; 

const handleMulterError = (err) => {
  if (err && err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return "Unable to upload image. Make sure that only allowed key name is used and only one file is uploaded at a time.";
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return "Unable to upload image. Max file size limit is 10MB.";
    }
  } else if (err) {
    return err.message;
  }
};

function handleMultipartData(req, res, next) {
  const upload = multer({
    storage,
    limits,
    fileFilter: function (req, file, callback) {
      const ext = path.extname(file.originalname).toLowerCase();

      if (
        ext !== ".png" &&
        ext !== ".jpg" &&
        ext !== ".jpeg" &&
        ext !== ".webp" &&
        ext !== ".pdf" &&
        ext !== ".mp3" &&
        ext !== ".wav"
      ) {
        return callback(
          new Error(
            "Only png, jpg/jpeg, webP images, pdf, mp3, or wav files are allowed"
          )
        );
      }
      callback(null, true);
    },
  }).any();

  upload(req, res, (err) => {
    const error = handleMulterError(err);

    if (error) {
      const response = badRequestResponse(error);
      return res.status(response.status.code).json(response);
    }

    if (!req.files || req.files.length === 0) {
      const response = badRequestResponse("No file to upload.");
      return res.status(response.status.code).json(response);
    }

    next();
  });
}

module.exports = handleMultipartData;
