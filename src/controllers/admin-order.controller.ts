import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../lib/prisma.js";

import { updateOrderStatusSchema } from "../schemas/admin-order.schema.js";

export const adminOrderController = {
  async getAllOrders(_req: Request, res: Response) {
    try {
      // Lors de la consultation admin, , cela annule les commandes restées en attente depuis au moins 30 jours.
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      const expirationDate = new Date(Date.now() - thirtyDays);

      await prisma.order.updateMany({
        where: {
          status: "pending",
          order_date: {
            lte: expirationDate,
          },
        },
        data: {
          status: "cancelled",
        },
      });
      const orders = await prisma.order.findMany({
        orderBy: {
          order_date: "desc",
        },
        include: {
          user: {
            select: {
              firstname: true,
              lastname: true,
              email: true,
            },
          },
        },
      });

      const response = orders.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        orderDate: order.order_date,
        totalAmount: order.total_amount.toFixed(2),
        status: order.status,
        user: order.user,
      }));

      return res.status(StatusCodes.OK).json(response);
    } catch {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Les commandes n'ont pas pu être récupérées.",
      });
    }
  },

  async updateOrderStatus(req: Request<{ id: string }>, res: Response) {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Vous n'êtes pas connecté.",
      });
    }

    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "L'identifiant de la commande est invalide.",
      });
    }

    const result = updateOrderStatusSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Les données du statut de la commande sont invalides.",
      });
    }

    try {
      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

      if (!order) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: "La commande est introuvable.",
        });
      }

      // Une commande déjà validée ou annulée ne peut plus être modifiée.

      if (order.status !== "pending") {
        return res.status(StatusCodes.CONFLICT).json({
          error: "Le statut de la commande ne peut plus être modifié.",
        });
      }

      const updatedOrder = await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: result.data.status,
        },
      });

      return res.status(StatusCodes.OK).json({
        id: updatedOrder.id,
        status: updatedOrder.status,
      });
    } catch {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Le statut de la commande n'a pas pu être modifié.",
      });
    }
  },
};
