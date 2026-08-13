const express = require("express");
const { addExpense, deleteExpense, getExpenses } = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", addExpense);
router.get("/", getExpenses);
router.delete("/:id", deleteExpense);

module.exports = router;
