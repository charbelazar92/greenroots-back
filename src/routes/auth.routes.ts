import { Router } from "express";
import { loginRateLimit,registerRateLimit, refreshRateLimit } from "../middlewares/auth-rate-limit.middleware.ts";

import { loginController,registerController,refreshController,logoutController,} from "../controllers/auth.controller.ts";
const router = Router();

router.post("/register", registerRateLimit , registerController);
router.post("/login",loginRateLimit,  loginController);
router.post("/refresh",refreshRateLimit, refreshController);
router.post("/logout", logoutController);

export default router