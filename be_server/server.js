import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";

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

/*
========================
DATABASE CONNECTION
========================
*/
connectDB();

/*
========================
MIDDLEWARE
========================
*/
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer().none());

/*
========================
HEALTH CHECK
========================
*/
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running Boss!!",
  });
});

/*
========================
API ROUTES
========================
*/
app.use("/api/auth", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/payslips", payslipRouter);
app.use("/api/dashboard", dashboardRouter);

/*
========================
INNGEST
========================
*/
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  }),
);

/*
========================
404 HANDLER
========================
*/
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

/*
========================
GLOBAL ERROR HANDLER
========================
*/
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/*
========================
LOCAL DEVELOPMENT ONLY
========================
*/
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

/*
========================
EXPORT FOR VERCEL
========================
*/
export default app;
