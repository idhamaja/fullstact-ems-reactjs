import express from "express";
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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://fullstact-ems-reactjs-fe-client.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// ✅ CORS middleware paling atas
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "false");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    // Log full error for debugging
    console.error("DB Connection Error:", error); // <-- full error, not just message
    return res.status(500).json({
      error: "Database connection failed",
      detail: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Server is running Boss Mantaps!!");
});

// ✅ DEBUG ONLY - hapus setelah fix
app.get("/api/debug/check-admin", async (req, res) => {
  try {
    const User = (await import("./models/User.js")).default;
    const user = await User.findOne({ email: "admin@example.com" }).select(
      "+password",
    );
    if (!user)
      return res.json({ found: false, message: "Admin not found in database" });
    return res.json({
      found: true,
      email: user.email,
      role: user.role,
      passwordLength: user.password?.length,
      passwordStart: user.password?.substring(0, 7),
      isHashedPassword:
        user.password?.startsWith("$2b$") || user.password?.startsWith("$2a$"),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/payslips", payslipRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/uploads", express.static("uploads"));

app.use("/api/inngest", serve({ client: inngest, functions }));

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} Boss Let's Go!!!`);
  });
}

export default app;
