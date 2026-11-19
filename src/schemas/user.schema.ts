import { z } from "zod";

export const updateUserSchema = z
  .object({
    firstname: z
      .string()
      .trim()
      .min(1, "Le prénom ne peut pas être vide.")
      .max(128, "Le prénom ne peut pas dépasser 128 caractères.")
      .optional(),

    lastname: z
      .string()
      .trim()
      .min(1, "Le nom ne peut pas être vide.")
      .max(128, "Le nom ne peut pas dépasser 128 caractères.")
      .optional(),

    email: z
      .string()
      .trim()
      .max(254, "L’adresse e-mail ne peut pas dépasser 254 caractères.")
      .pipe(z.email("L’adresse e-mail est invalide."))
      .optional(),
  })
  .refine(
    (data) =>
      data.firstname !== undefined ||
      data.lastname !== undefined ||
      data.email !== undefined,
    "Au moins une information doit être fournie.",
  );


  export const deleteUserSchema = z.object({
  password: z
  .string()
  .min(1, "Veuillez saisir votre mot de passe actuel.")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères."),
});