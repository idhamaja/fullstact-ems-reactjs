import { Router } from "express";
import { protect, protectAdmin } from "../middleware/auth.js";
import {
  createPayslip,
  getPayslip,
  getPayslipById,
} from "../controller/payslipController.js";

const payslipsRouter = Router();

payslipsRouter.post("/", protect, protectAdmin, createPayslip);
payslipsRouter.get("/", protect, getPayslip);
payslipsRouter.get("/:id", protect, getPayslipById);

export default payslipsRouter;
