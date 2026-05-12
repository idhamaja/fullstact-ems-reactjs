import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  clockInandOut,
  getAttendance,
} from "../controller/attendanceController.js";

const attendanceRouter = Router();

attendanceRouter.post("/", protect, clockInandOut);
attendanceRouter.get("/", protect, getAttendance);

export default attendanceRouter;
