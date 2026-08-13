const Expense = require("../models/Expense");

const addExpense = async (req, res, next) => {
  try {
    const { description, amount, category, date } = req.body;

    if (!description || amount === undefined || !category) {
      return res.status(400).json({ message: "Missing required expense fields" });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({ message: "Amount cannot be negative" });
    }

    const allowedCategories = ["Rent", "Electricity", "Labour", "Other"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid expense category" });
    }

    const expense = await Expense.create({
      userId: req.user.id,
      description: String(description).trim(),
      amount: Number(amount),
      category,
      date: date ? new Date(date) : new Date(),
    });

    return res.status(201).json(expense);
  } catch (error) {
    return next(error);
  }
};

const getExpenses = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = { userId: req.user.id };

    if (from || to) {
      query.date = {};

      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({ message: "Invalid from date" });
        }
        query.date.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({ message: "Invalid to date" });
        }
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
    return res.json(expenses);
  } catch (error) {
    return next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }
    return res.json({ message: "Expense deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addExpense,
  getExpenses,
  deleteExpense,
};
