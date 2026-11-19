import { z } from "zod";

export const treeBodySchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(128, "Le nom ne peut pas dépasser 128 caractères."),
  price: z.coerce.number().positive("Le prix doit être positif."),
  species: z.string().trim().min(1, "L'espèce est requise.").max(128, "L'espèce ne peut pas dépasser 128 caractères."),
  description: z.string().trim().max(2000, "La description est trop longue.").optional(),
  available: z.string().optional(),
});

//Rend tous les champs optionnels sans avoir à recopier et rajouter "optional"
export const treeUpdateSchema = treeBodySchema.partial();