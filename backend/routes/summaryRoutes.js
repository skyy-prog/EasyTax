const express = require("express");
const {
  generateDailySummary,
  getSummaryHistory,
  getTodaySummary,
} = require("../controllers/summaryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/today", getTodaySummary);
router.post("/generate", generateDailySummary);
router.get("/history", getSummaryHistory);

module.exports = router;
