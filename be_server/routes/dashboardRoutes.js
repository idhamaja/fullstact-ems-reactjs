import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getDashboardEMS } from "../controller/dashboardController.js";

const dashboardRouter = Router();

dashboardRouter.get("/", protect, getDashboardEMS);

export default dashboardRouter;
