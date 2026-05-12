import { Router } from "express";
import {
  changePassword,
  getSession,
  login,
} from "../controller/AuthController.js";
import { protect } from "../middleware/auth.js";


const authhRouter = Router();

authhRouter.post("/login", login);
authhRouter.get("/session", protect, getSession);
authhRouter.post("/change-password", protect, changePassword);

export default authhRouter;
