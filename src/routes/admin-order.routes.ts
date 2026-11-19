import { Router } from "express";

import { adminOrderController } from "../controllers/admin-order.controller.js";
import { verifyAuth, verifyAdmin,} from "../middlewares/auth.middleware.js";

const router = Router();

router.get( "/", verifyAuth,verifyAdmin,adminOrderController.getAllOrders,)
router.patch("/:id/status",verifyAuth,verifyAdmin,adminOrderController.updateOrderStatus,);
;

export default router;