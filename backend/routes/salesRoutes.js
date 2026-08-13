const express = require("express");
const { addSale, getSalesByDate, getSalesToday } = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", addSale);
router.get("/today", getSalesToday);
router.get("/", getSalesByDate);

module.exports = router;
