import { z } from "zod";

const orderItemSchema = z.object({
  treeId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1),
  })
  .refine(
    ({ items }) =>
      new Set(items.map((item) => item.treeId)).size === items.length,
    {
      message: "Un arbre ne peut apparaître qu'une seule fois.",
      path: ["items"],
    },
  );