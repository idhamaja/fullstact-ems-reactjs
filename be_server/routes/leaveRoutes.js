import { Router } from "express";
import { protect, protectAdmin } from "../middleware/auth.js";
import {
  createLeave,
  getLeave,
  getLeaveEvidence,
  updateLeaveStatus,
  upload,
} from "../controller/leaveController.js";

const leaveRouter = Router();

leaveRouter.post("/", protect, upload.single("evidence"), createLeave);
leaveRouter.get("/", protect, getLeave);

// Endpoint lazy-load evidence — dipakai admin saat klik thumbnail
leaveRouter.get("/:id/evidence", protect, protectAdmin, getLeaveEvidence);

leaveRouter.patch("/:id", protect, protectAdmin, updateLeaveStatus);

export default leaveRouter;
