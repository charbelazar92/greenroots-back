import { Router } from "express";

import {
  updateUserController,
  deleteUserController,
} from "../controllers/user.controller.ts";
import { verifyAuth } from "../middlewares/auth.middleware.ts";

import { deleteAccountRateLimit } from "../middlewares/auth-rate-limit.middleware.ts";

const router = Router();

router.patch("/me/profile", verifyAuth, updateUserController);
router.delete( "/me", verifyAuth, deleteAccountRateLimit, deleteUserController,);


export default router