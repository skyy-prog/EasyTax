const express = require("express");
const { askGemini, getHealthCheck } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/health-check", getHealthCheck);
router.post("/", askGemini);

module.exports = router;
