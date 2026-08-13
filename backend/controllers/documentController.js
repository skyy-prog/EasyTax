const fs = require("fs");
const path = require("path");
const Document = require("../models/Document");

const allowedTypes = ["Invoice", "PAN", "GST Certificate", "Other"];

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File upload is required" });
    }

    const fileType = req.body.fileType || "Other";
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    const doc = await Document.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: relativePath,
      fileType,
    });

    return res.status(201).json(doc);
  } catch (error) {
    return next(error);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const withUrls = docs.map((doc) => ({
      ...doc.toObject(),
      fileUrl: `${req.protocol}://${req.get("host")}${doc.filePath}`,
    }));

    return res.json(withUrls);
  } catch (error) {
    return next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const fullPath = path.join(__dirname, "..", doc.filePath);
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== "ENOENT") {
        return next(err);
      }
      return res.json({ message: "Document deleted" });
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
};
