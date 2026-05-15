import multer from "multer";
import path from "path";
import fs from "fs";
import { inngest } from "../inngest/index.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";

// ─── Multer Setup ─────────────────────────────────────────────────────────────
// Pakai diskStorage agar file tersimpan dan bisa diakses via /uploads/evidence/...
// server.js sudah punya: app.use("/uploads", express.static("uploads"))

const UPLOAD_DIR = "uploads/evidence";

// Buat folder jika belum ada (aman dijalankan berkali-kali)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `evidence-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
  const allowedExts = /\.(jpeg|jpg|png|pdf)$/i;
  const extOk = allowedExts.test(path.extname(file.originalname));
  const mimeOk = allowedMimes.includes(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ─── POST /api/leave ──────────────────────────────────────────────────────────
export const createLeave = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body missing." });
    }

    const session = req.session;
    const employee = await Employee.findOne({ userId: session.userId });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    if (employee.isDeleted) {
      return res.status(403).json({
        error: "Your account is deactivated. You cannot apply for leave.",
      });
    }

    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        error: "Missing required fields: type, startDate, endDate, reason",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(startDate) <= today || new Date(endDate) <= today) {
      return res
        .status(400)
        .json({ error: "Leave dates must be in the future" });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res
        .status(400)
        .json({ error: "End date cannot be before start date" });
    }

    // Bangun URL publik yang bisa diakses browser: /uploads/evidence/<filename>
    // server.js sudah serve folder ini via express.static
    const evidenceUrl = req.file
      ? `/uploads/evidence/${req.file.filename}`
      : null;

    const leave = await LeaveApplication.create({
      employeeId: employee._id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      evidenceUrl,
      status: "PENDING",
    });

    await inngest.send({
      name: "leave/pending",
      data: { leaveApplicationId: leave._id },
    });

    return res.status(201).json({ success: true, data: leave });
  } catch (error) {
    console.error("[createLeave]", error);
    return res
      .status(500)
      .json({ error: "Failed to submit leave application" });
  }
};

// ─── GET /api/leave ───────────────────────────────────────────────────────────
export const getLeave = async (req, res) => {
  try {
    const session = req.session;
    const isAdmin = session.role === "ADMIN";

    if (isAdmin) {
      const { status } = req.query;
      const where = status ? { status } : {};

      const leaves = await LeaveApplication.find(where)
        .populate("employeeId")
        .sort({ createdAt: -1 });

      const data = leaves.map((l) => {
        const obj = l.toObject();
        return {
          ...obj,
          id: obj._id.toString(),
          employee: obj.employeeId,
          employeeId: obj.employeeId?._id?.toString(),
        };
      });

      return res.json({ data });
    }

    const employee = await Employee.findOne({ userId: session.userId }).lean();
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const leaves = await LeaveApplication.find({
      employeeId: employee._id,
    }).sort({ createdAt: -1 });

    return res.json({
      data: leaves,
      employee: { ...employee, id: employee._id.toString() },
    });
  } catch (error) {
    console.error("[getLeave]", error);
    return res.status(500).json({ error: "Failed to fetch leave data" });
  }
};

// ─── PATCH /api/leave/:id ─────────────────────────────────────────────────────
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const leave = await LeaveApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!leave) {
      return res.status(404).json({ error: "Leave application not found" });
    }

    return res.json({ success: true, data: leave });
  } catch (error) {
    console.error("[updateLeaveStatus]", error);
    return res.status(500).json({ error: "Failed to update leave status" });
  }
};
