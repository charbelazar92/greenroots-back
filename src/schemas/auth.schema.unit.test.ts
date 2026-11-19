import { describe, expect, test } from "vitest";

import { registerSchema } from "./auth.schema.ts";

describe("registerSchema", () => {
  test("accepte des données d'inscription valides", () => {
    const result = registerSchema.safeParse({
      firstname: "Camille",
      lastname: "Honette",
      email: "camille@greenroots.fr",
      password: "Greenroots123",
    });

    expect(result.success).toBe(true);
  });

  test("refuse un mot de passe sans majuscule", () => {
    const result = registerSchema.safeParse({
      firstname: "Camille",
      lastname: "Honette",
      email: "camille@greenroots.fr",
      password: "greenroots123",
    });

    expect(result.success).toBe(false);
  });

  test("refuse une adresse e-mail invalide", () => {
    const result = registerSchema.safeParse({
      firstname: "Camille",
      lastname: "Honette",
      email: "camille.com",
      password: "Greenroots123",
    });

    expect(result.success).toBe(false);
  });
});