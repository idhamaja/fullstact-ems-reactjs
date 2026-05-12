import { Router } from "express";
import { protect } from "../middleware/auth.js"; // ✅ added .js
import { getProfile, updateProfile } from "../controller/profileController.js";

const profileRouter = Router();

profileRouter.get("/", protect, getProfile);
profileRouter.post("/", protect, updateProfile);

export default profileRouter;
