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
// allow CORS from the configured client URL and localhost during development
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like CURL or mobile apps)
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
