const DailySummary = require("../models/DailySummary");
const Expense = require("../models/Expense");
const Sale = require("../models/Sale");
const { getISTDayRange } = require("./salesController");

const round2 = (value) => Math.round(value * 100) / 100;

const normalizeSummary = (summary) => ({
  _id: summary?._id,
  date: summary?.date,
  totalRevenue: summary?.totalRevenue || 0,
  totalCost: summary?.totalCost || 0,
  totalGST: summary?.totalGST || 0,
  totalExpenses: summary?.totalExpenses || 0,
  netProfit: summary?.netProfit || 0,
  salesCount: summary?.salesCount || 0,
  totalSales: summary?.totalRevenue || 0,
  gstCollected: summary?.totalGST || 0,
});

const generateDailySummary = async (req, res, next) => {
  try {
    const { start, end } = getISTDayRange();

    const sales = await Sale.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end },
    }).populate("productId", "costPrice");

    const expenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end },
    });

    const totals = sales.reduce(
      (acc, sale) => {
        const costPrice = Number(sale.productId?.costPrice || 0);
        acc.totalRevenue += Number(sale.totalAmount || 0);
        acc.totalGST += Number(sale.gstCollected || 0);
        acc.totalCost += costPrice * Number(sale.quantity || 0);
        acc.salesCount += 1;
        return acc;
      },
      { totalRevenue: 0, totalGST: 0, totalCost: 0, salesCount: 0 }
    );

    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const summaryPayload = {
      totalRevenue: round2(totals.totalRevenue),
      totalCost: round2(totals.totalCost),
      totalGST: round2(totals.totalGST),
      totalExpenses: round2(totalExpenses),
      netProfit: round2(totals.totalRevenue - totalExpenses),
      salesCount: totals.salesCount,
    };

    const summary = await DailySummary.findOneAndUpdate(
      { userId: req.user.id, date: start },
      { ...summaryPayload, userId: req.user.id, date: start },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json(normalizeSummary(summary));
  } catch (error) {
    return next(error);
  }
};

const getSummaryHistory = async (req, res, next) => {
  try {
    const days = Number(req.query.days || 30);
    const limit = Number.isFinite(days) && days > 0 ? Math.min(days, 365) : 30;

    const history = await DailySummary.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(limit);

    return res.json(history.map(normalizeSummary));
  } catch (error) {
    return next(error);
  }
};

const getTodaySummary = async (req, res, next) => {
  try {
    const { start } = getISTDayRange();
    const summary = await DailySummary.findOne({ userId: req.user.id, date: start });

    if (!summary) {
      return res.json({
        date: start,
        totalRevenue: 0,
        totalCost: 0,
        totalGST: 0,
        totalExpenses: 0,
        netProfit: 0,
        salesCount: 0,
        totalSales: 0,
        gstCollected: 0,
      });
    }

    return res.json(normalizeSummary(summary));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateDailySummary,
  getSummaryHistory,
  getTodaySummary,
};
