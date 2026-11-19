import { describe, expect, test } from "vitest";

import {deleteUserSchema,updateUserSchema} from "./user.schema.ts";

describe("updateUserSchema", () => {
  test("accepte la modification d'une seule information", () => {
    const result = updateUserSchema.safeParse({
      email: "camille.honnette@greenroots.fr",
    });

    expect(result.success).toBe(true);
  });

  test("refuse une modification sans aucune information", () => {
    const result = updateUserSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  test("refuse un prénom vide", () => {
    const result = updateUserSchema.safeParse({
      firstname: "",
    });

    expect(result.success).toBe(false);
  });

  test("refuse une adresse e-mail invalide", () => {
    const result = updateUserSchema.safeParse({
      email: "camille.honnete.com",
    });

    expect(result.success).toBe(false);
  });
});

describe("deleteUserSchema", () => {
  test("accepte une demande contenant le mot de passe actuel", () => {
    const result = deleteUserSchema.safeParse({
      password: "GreenRoots123",
    });

    expect(result.success).toBe(true);
  });

  test("refuse une demande sans mot de passe", () => {
    const result = deleteUserSchema.safeParse({
      password: "",
    });

    expect(result.success).toBe(false);
  });
});