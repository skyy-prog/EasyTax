const Product = require("../models/Product");
const Sale = require("../models/Sale");

const round2 = (value) => Math.round(value * 100) / 100;

const getISTDayRange = (sourceDate = new Date()) => {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(sourceDate.getTime() + istOffsetMs);
  const startUtcMs =
    Date.UTC(istTime.getUTCFullYear(), istTime.getUTCMonth(), istTime.getUTCDate(), 0, 0, 0, 0) -
    istOffsetMs;
  return {
    start: new Date(startUtcMs),
    end: new Date(startUtcMs + 24 * 60 * 60 * 1000 - 1),
  };
};

const addSale = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: "Product and quantity are required" });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }

    const product = await Product.findOne({ _id: productId, userId: req.user.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const baseAmount = round2(Number(quantity) * Number(product.sellPrice));
    const gstCollected = round2((baseAmount * Number(product.gstSlab)) / 100);
    const totalAmount = round2(baseAmount + gstCollected);

    const sale = await Sale.create({
      userId: req.user.id,
      productId: product._id,
      quantity: Number(quantity),
      baseAmount,
      gstCollected,
      totalAmount,
      date: new Date(),
    });

    return res.status(201).json(sale);
  } catch (error) {
    return next(error);
  }
};

const getSalesToday = async (req, res, next) => {
  try {
    const { start, end } = getISTDayRange();
    const sales = await Sale.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end },
    })
      .populate("productId", "name")
      .sort({ date: -1, createdAt: -1 });

    const normalized = sales.map((sale) => ({
      _id: sale._id,
      productId: sale.productId?._id || sale.productId,
      productName: sale.productId?.name || "Unknown",
      quantity: sale.quantity,
      baseAmount: sale.baseAmount,
      gstCollected: sale.gstCollected,
      gstAmount: sale.gstCollected,
      totalAmount: sale.totalAmount,
      date: sale.date,
      createdAt: sale.createdAt,
    }));

    return res.json(normalized);
  } catch (error) {
    return next(error);
  }
};

const getSalesByDate = async (req, res, next) => {
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

    const sales = await Sale.find(query)
      .populate("productId", "name")
      .sort({ date: -1, createdAt: -1 });

    const normalized = sales.map((sale) => ({
      _id: sale._id,
      productId: sale.productId?._id || sale.productId,
      productName: sale.productId?.name || "Unknown",
      quantity: sale.quantity,
      baseAmount: sale.baseAmount,
      gstCollected: sale.gstCollected,
      gstAmount: sale.gstCollected,
      totalAmount: sale.totalAmount,
      date: sale.date,
      createdAt: sale.createdAt,
    }));

    return res.json(normalized);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addSale,
  getSalesToday,
  getSalesByDate,
  getISTDayRange,
};
