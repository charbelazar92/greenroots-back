import { Router } from "express";

import { orderController } from "../controllers/order.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Crée une commande pour l'utilisateur connecté.
router.post("/", verifyAuth, orderController.createOrder);

// Récupère les commandes réalisées par l'utilisateur connecté
router.get("/", verifyAuth, orderController.getMyOrders);

// Récupère une commande de l'utilisateur connecté.
router.get("/:id", verifyAuth, orderController.getOrderById);

export default router;