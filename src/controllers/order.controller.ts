import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { createOrderSchema } from "../schemas/order.schema.js";

type OrderParams = {
  id: string;
};

export const orderController = {
  async createOrder(req: Request, res: Response) {
    // Vérifie les données du panier.
    const result = createOrderSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Les données de la commande sont invalides.",
      });
    }

    // Vérifie que l'utilisateur est connecté.
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Vous n'êtes pas connecté.",
      });
    }

    const { items } = result.data;
    const treeIds = items.map((item) => item.treeId);

    try {
      // Recherche une commande en attente de paiement
      // appartenant à l'utilisateur connecté.
      const pendingOrder = await prisma.order.findFirst({
        where: {
          user_id: req.user.id,
          status: "pending",
        },
        include: {
          order_trees: {
            include: {
              tree: true,
            },
          },
        },
      });

      // Refuse la création si l'utilisateur possède déjà
      // une commande en attente de paiement.
      if (pendingOrder) {
        return res.status(StatusCodes.CONFLICT).json({
          error:
            "Vous avez déjà une commande en attente de paiement.",
          order: {
            id: pendingOrder.id,
            orderNumber: pendingOrder.order_number,
            orderDate: pendingOrder.order_date,
            status: pendingOrder.status,
            totalAmount:
              pendingOrder.total_amount.toFixed(2),
            items: pendingOrder.order_trees.map(
              (orderTree) => ({
                treeId: orderTree.tree.id,
                name: orderTree.tree.name,
                slug: orderTree.tree.slug,
                urlImage: orderTree.tree.url_image,
                quantity: orderTree.quantity,
                unitPrice:
                  orderTree.unit_price.toFixed(2),
                lineTotal: orderTree.unit_price
                  .mul(orderTree.quantity)
                  .toFixed(2),
              }),
            ),
          },
        });
      }

      // Récupère les arbres demandés.
      const trees = await prisma.tree.findMany({
        where: {
          id: {
            in: treeIds,
          },
        },
      });

      // Vérifie que tous les arbres existent.
      if (trees.length !== treeIds.length) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: "Un ou plusieurs arbres n'existent pas.",
        });
      }

      // Vérifie que tous les arbres sont disponibles.
      const unavailableTree = trees.find(
        (tree) => !tree.available,
      );

      if (unavailableTree) {
        return res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .json({
            error: `L'arbre ${unavailableTree.name} n'est pas disponible.`,
          });
      }

      // Calcule le montant total de la commande.
      let totalAmount = new Prisma.Decimal(0);

      for (const item of items) {
        const tree = trees.find(
          (tree) => tree.id === item.treeId,
        );

        if (tree) {
          const lineTotal = tree.price.mul(item.quantity);
          totalAmount = totalAmount.plus(lineTotal);
        }
      }

      // Génère la référence publique de la commande.
      const orderNumber =
        `GR-${randomUUID()
          .replaceAll("-", "")
          .slice(0, 8)
          .toUpperCase()}`;

      // Crée la commande et ses lignes ensemble.
      const order = await prisma.$transaction(
        async (transaction) => {
          const newOrder = await transaction.order.create({
            data: {
              order_number: orderNumber,
              user_id: req.user!.id,
              total_amount: totalAmount,
            },
          });

          // Crée une ligne pour chaque arbre commandé.
          for (const item of items) {
            const tree = trees.find(
              (tree) => tree.id === item.treeId,
            );

            if (tree) {
              await transaction.orderTree.create({
                data: {
                  order_id: newOrder.id,
                  tree_id: tree.id,
                  quantity: item.quantity,

                  // Conserve le prix au moment de la commande.
                  unit_price: tree.price,
                },
              });
            }
          }

          return newOrder;
        },
      );

      // Récupère la commande complète.
      const completeOrder = await prisma.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          order_trees: {
            include: {
              tree: true,
            },
          },
        },
      });

      if (!completeOrder) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: "La commande créée est introuvable.",
        });
      }

      // Prépare les données envoyées au front.
      const response = {
        id: completeOrder.id,
        orderNumber: completeOrder.order_number,
        orderDate: completeOrder.order_date,
        status: completeOrder.status,
        totalAmount:
          completeOrder.total_amount.toFixed(2),
        items: completeOrder.order_trees.map(
          (orderTree) => ({
            treeId: orderTree.tree.id,
            name: orderTree.tree.name,
            slug: orderTree.tree.slug,
            urlImage: orderTree.tree.url_image,
            quantity: orderTree.quantity,
            unitPrice:
              orderTree.unit_price.toFixed(2),
            lineTotal: orderTree.unit_price
              .mul(orderTree.quantity)
              .toFixed(2),
          }),
        ),
      };

      return res
        .status(StatusCodes.CREATED)
        .json(response);
    } catch {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          error: "La commande n'a pas pu être créée.",
        });
    }
  },

  async getMyOrders(req: Request, res: Response) {
    // Vérifie que l'utilisateur est connecté.
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Vous n'êtes pas connecté.",
      });
    }

    try {
      // Recherche uniquement les commandes de
      // l'utilisateur connecté.
      const orders = await prisma.order.findMany({
        where: {
          user_id: req.user.id,
        },
        include: {
          order_trees: {
            include: {
              tree: true,
            },
          },
        },
        orderBy: {
          order_date: "desc",
        },
      });

      // Prépare les données envoyées au front.
      const response = orders.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.total_amount.toFixed(2),
        items: order.order_trees.map((orderTree) => ({
          treeId: orderTree.tree.id,
          name: orderTree.tree.name,
          slug: orderTree.tree.slug,
          urlImage: orderTree.tree.url_image,
          quantity: orderTree.quantity,
          unitPrice: orderTree.unit_price.toFixed(2),
          lineTotal: orderTree.unit_price
            .mul(orderTree.quantity)
            .toFixed(2),
        })),
      }));

      return res
        .status(StatusCodes.OK)
        .json(response);
    } catch {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          error:
            "Les commandes n'ont pas pu être récupérées.",
        });
    }
  },

  async getOrderById(
    req: Request<OrderParams>,
    res: Response,
  ) {
    // Vérifie que l'utilisateur est connecté.
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Vous n'êtes pas connecté.",
      });
    }

    // Convertit l'identifiant interne reçu dans l'URL.
    const orderId = Number(req.params.id);

    // Vérifie que l'identifiant est valide.
    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error:
          "L'identifiant de la commande est invalide.",
      });
    }

    try {
      // Recherche uniquement une commande de
      // l'utilisateur connecté.
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          user_id: req.user.id,
        },
        include: {
          order_trees: {
            include: {
              tree: true,
            },
          },
        },
      });

      // La commande est absente ou appartient
      // à un autre utilisateur.
      if (!order) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: "Commande introuvable.",
        });
      }

      // Prépare les données envoyées au front.
      const response = {
        id: order.id,
        orderNumber: order.order_number,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.total_amount.toFixed(2),
        items: order.order_trees.map((orderTree) => ({
          treeId: orderTree.tree.id,
          name: orderTree.tree.name,
          slug: orderTree.tree.slug,
          urlImage: orderTree.tree.url_image,
          quantity: orderTree.quantity,
          unitPrice: orderTree.unit_price.toFixed(2),
          lineTotal: orderTree.unit_price
            .mul(orderTree.quantity)
            .toFixed(2),
        })),
      };

      return res
        .status(StatusCodes.OK)
        .json(response);
    } catch {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          error:
            "La commande n'a pas pu être récupérée.",
        });
    }
  },
};