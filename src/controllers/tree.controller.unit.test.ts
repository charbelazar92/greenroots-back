import { vi,describe, expect, test } from "vitest";
import { slugTransfrom } from "./tree.controller";

vi.mock("../lib/supabase.ts", () => ({
  supabase: {},
}));

describe("slugTransfrom", () => {
  test("transforme le nom d'un arbre en slug", () => {
    expect(slugTransfrom("Bouleau verruqueux"))
      .toBe("bouleau-verruqueux");
  });

  test("supprime les accents", () => {
    expect(slugTransfrom("Châtaignier commun"))
      .toBe("chataignier-commun");
  });

  test("supprime les caractères spéciaux", () => {
    expect(slugTransfrom("Pin sylvestre !"))
      .toBe("pin-sylvestre");
  });
});



