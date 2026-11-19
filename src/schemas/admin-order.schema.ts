import { z } from "zod";

// Une commande en attente peut être validée ou annulée.
export const updateOrderStatusSchema = z.object({
  status: z.enum(["validated", "cancelled"], {
    error: "Le statut doit être validated ou cancelled.",
  }),
})


