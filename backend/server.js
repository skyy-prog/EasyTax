const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { getAllowedOrigins, getUploadDir, validateEnv } = require("./config/env");
const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const documentRoutes = require("./routes/documentRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();
validateEnv();

const app = express();
app.set("trust proxy", 1);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = getAllowedOrigins();

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));

const healthHandler = (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.use(globalLimiter);

app.use("/uploads", express.static(path.resolve(__dirname, getUploadDir())));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/chat", chatRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorMiddleware);

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      process.stdout.write(`EasyTax API running at http://localhost:${PORT}\n`);
    });
  } catch (error) {
    process.stderr.write(`MongoDB connection failed: ${error.message}\n`);
    process.exit(1);
  }
};

startServer();
