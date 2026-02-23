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
// allow CORS from the configured client URL(s) and localhost during development
// CLIENT_URL can be a comma-separated list of origins (production & dev). If it's
// missing we still add the common localhost dev URL so the server never throws.
const rawOrigins = process.env.CLIENT_URL || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean)
  .concat("http://localhost:5173");
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server requests (no origin) or any allowed origin
      if (!origin || allowedOrigins.includes(origin)) {
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
