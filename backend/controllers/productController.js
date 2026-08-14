const Product = require("../models/Product");

const allowedGstSlabs = [0, 5, 12, 18, 28];
const allowedUnits = ["pcs", "kg", "litre"];

const normalizeUnit = (unit) => String(unit || "").trim().toLowerCase();

const addProduct = async (req, res, next) => {
  try {
    const { name, category, costPrice, sellPrice, gstSlab, unit } = req.body;

    if (!name || costPrice === undefined || sellPrice === undefined || gstSlab === undefined || !unit) {
      return res.status(400).json({ message: "Missing required product fields" });
    }

    if (!allowedGstSlabs.includes(Number(gstSlab))) {
      return res.status(400).json({ message: "Invalid GST slab" });
    }

    const normalizedUnit = normalizeUnit(unit);

    if (!allowedUnits.includes(normalizedUnit)) {
      return res.status(400).json({ message: "Invalid unit" });
    }

    if (Number(costPrice) < 0 || Number(sellPrice) < 0) {
      return res.status(400).json({ message: "Prices cannot be negative" });
    }

    const product = await Product.create({
      userId: req.user.id,
      name: String(name).trim(),
      category: category ? String(category).trim() : undefined,
      costPrice: Number(costPrice),
      sellPrice: Number(sellPrice),
      gstSlab: Number(gstSlab),
      unit: normalizedUnit,
    });

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const update = {};
    const allowedFields = ["name", "category", "costPrice", "sellPrice", "gstSlab", "unit"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    if (update.gstSlab !== undefined && !allowedGstSlabs.includes(Number(update.gstSlab))) {
      return res.status(400).json({ message: "Invalid GST slab" });
    }

    if (update.unit !== undefined) {
      update.unit = normalizeUnit(update.unit);
    }

    if (update.unit !== undefined && !allowedUnits.includes(update.unit)) {
      return res.status(400).json({ message: "Invalid unit" });
    }

    if (update.costPrice !== undefined && Number(update.costPrice) < 0) {
      return res.status(400).json({ message: "Cost price cannot be negative" });
    }

    if (update.sellPrice !== undefined && Number(update.sellPrice) < 0) {
      return res.status(400).json({ message: "Sell price cannot be negative" });
    }

    if (update.name !== undefined) update.name = String(update.name).trim();
    if (update.category !== undefined) update.category = String(update.category).trim();
    if (update.costPrice !== undefined) update.costPrice = Number(update.costPrice);
    if (update.sellPrice !== undefined) update.sellPrice = Number(update.sellPrice);
    if (update.gstSlab !== undefined) update.gstSlab = Number(update.gstSlab);

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
