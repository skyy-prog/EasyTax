const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { getUploadDir } = require("../config/env");

const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "-");
const uploadDir = path.resolve(__dirname, "..", getUploadDir());

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${sanitizeName(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (!allowedMimes.includes(file.mimetype)) {
    const error = new Error("Only PDF, JPG, JPEG, and PNG files are allowed");
    error.statusCode = 400;
    return cb(error);
  }

  return cb(null, true);
};

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 5);

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxUploadMb * 1024 * 1024,
  },
});

module.exports = upload;
