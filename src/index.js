require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");
const authRoutes = require("./routes/auth.routes");
const instituteRoutes = require("./routes/institute.routes");
const studentRoutes = require("./routes/student.routes");
const courseRoutes = require("./routes/course.routes");
const resultRoutes = require("./routes/result.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT) || 1000,
  message: {
    status_code: 429,
    status: "error",
    message: "Too many requests from this IP, please try again later",
  },
});

app.use(limiter);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status_code: 500,
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
