require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const { initCronJobs } = require("./utils/cronService");

const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return value.trim();
  }
};

// CLIENT_URL supports comma-separated origins.
// Example: https://your-app.vercel.app,http://localhost:5173
const rawOrigins = process.env.CLIENT_URL || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const isLocalDevOrigin = (origin) =>
  /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server/no-origin requests, configured origins, and localhost dev ports.
      if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
  })
);
app.use(express.json());
app.use("/api/auth", authLimiter);

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  initCronJobs();
};

startServer();
