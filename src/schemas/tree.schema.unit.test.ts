import { describe, expect, test } from "vitest";
import { treeBodySchema } from "./tree.schema.ts";

describe("treeBodySchema", () => {
  test("accepte un arbre valide", () => {
    const result = treeBodySchema.safeParse({
      name: "Bouleau verruqueux",
      price: 25,
      species: "Betula pendula",
      description: "Un arbre adapté aux sols tempérés.",
      available: "on",
    });

    expect(result.success).toBe(true);
  });

  test("refuse le champ nom vide", () => {
    const result = treeBodySchema.safeParse({
      name: "",
      price: 25,
      species: "Betula pendula",
      description: "Un arbre.",
      available: "on",
    });

    expect(result.success).toBe(false);
  });

  test("refuse un prix négatif", () => {
    const result = treeBodySchema.safeParse({
      name: "Bouleau verruqueux",
      price: -2,
      species: "Betula pendula",
      description: "Un arbre.",
      available: "on",
    });

    expect(result.success).toBe(false);
  });

  test("refuse le champ espèce vide", () => {
    const result = treeBodySchema.safeParse({
      name: "Bouleau verruqueux",
      price: 10,
      species: "",
      description: "Un arbre.",
      available: "on",
    });

    expect(result.success).toBe(false);
  });
});

