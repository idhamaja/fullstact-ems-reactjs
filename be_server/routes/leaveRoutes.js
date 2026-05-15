import { Router } from "express";
import { protect, protectAdmin } from "../middleware/auth.js";
import {
  createLeave,
  getLeave,
  updateLeaveStatus,
  upload,
} from "../controller/leaveController.js";

const leaveRouter = Router();

// PENTING: upload.single("evidence") WAJIB ada di sini.
// Ini yang mem-parse multipart/form-data → req.body menjadi tersedia.
// Tanpa ini, req.body = undefined meskipun frontend mengirim data.
leaveRouter.post("/", protect, upload.single("evidence"), createLeave);

leaveRouter.get("/", protect, getLeave);

leaveRouter.patch("/:id", protect, protectAdmin, updateLeaveStatus);

export default leaveRouter;
