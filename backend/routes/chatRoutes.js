const express = require("express");
const { askGemini } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", askGemini);

module.exports = router;
