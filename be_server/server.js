import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";

import connectDB from "./config/db.js";

import authRouter from "./routes/authRoutes.js";
import employeeRouter from "./routes/employeeRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import payslipRouter from "./routes/payslipsRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(multer().none());

// Middleware: connect DB sebelum setiap request (penting untuk serverless cold start)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB middleware error:", error.message);
    res
      .status(500)
      .json({ error: "Database connection failed", detail: error.message });
  }
});

// Routes
app.get("/", (req, res) => {
  res.status(200).send("Server is running Boss!!");
});

app.use("/api/auth", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/payslips", payslipRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  }),
);

// Hanya listen kalau bukan di Vercel (development lokal)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} Boss Let's Go!!!`);
  });
}

export default app;
