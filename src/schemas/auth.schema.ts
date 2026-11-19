import { z } from "zod";

export const registerSchema = z.object({
  firstname: z.string().trim().min(1).max(128),
  lastname: z.string().trim().min(1).max(128),
  email: z.email().max(254),
  password: z
    .string()
    .min(8)
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères.")
    .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule.")
    .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre."),
});

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z
    .string()
    .min(1)
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères."),
});