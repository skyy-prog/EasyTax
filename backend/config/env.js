const parseList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isPlaceholder = (value) => {
  if (!value) {
    return true;
  }

  return /replace_with|your_|example\.com/i.test(value);
};

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value || isPlaceholder(value)) {
    throw new Error(`Missing production environment variable: ${name}`);
  }
  return value;
};

const validateEnv = () => {
  requireEnv("MONGO_URI");
  requireEnv("JWT_SECRET");

  if (process.env.NODE_ENV === "production") {
    const mongoUri = requireEnv("MONGO_URI");
    const clientUrl = requireEnv("CLIENT_URL");

    if (/localhost|127\.0\.0\.1/i.test(mongoUri)) {
      throw new Error("MONGO_URI must point to a production database in production");
    }

    if (/localhost|127\.0\.0\.1/i.test(clientUrl)) {
      throw new Error("CLIENT_URL must point to the deployed frontend in production");
    }

    if (String(process.env.JWT_SECRET).length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters in production");
    }
  }
};

const getAllowedOrigins = () => parseList(process.env.CLIENT_URL);
const getUploadDir = () => process.env.UPLOAD_DIR || "uploads";

module.exports = {
  getAllowedOrigins,
  getUploadDir,
  validateEnv,
};
