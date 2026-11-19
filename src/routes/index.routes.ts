import { Router } from "express";

import authRouter from "./auth.routes.js";
import orderRouter from "./order.routes.js";
import treeRouter from "./tree.routes.js";
import userRouter from "./user.routes.ts";
import adminOrderRouter from "./admin-order.routes.js";

export const router = Router();

router.use("/api/auth", authRouter);
router.use("/api/trees", treeRouter);
router.use("/api/users", userRouter);
router.use("/api/orders", orderRouter);
router.use("/api/admin/orders", adminOrderRouter);