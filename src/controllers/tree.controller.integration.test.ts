import { afterAll, afterEach, beforeEach, describe, expect, test } from "vitest";
import type { Request, Response } from "express";
import type { Tree } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.js";
import { treeController } from "./tree.controller.ts";


// Test récupération de tous les arbres
describe("[GET] /api/trees", () => {
  test("récupère les arbres depuis PostgreSQL", async () => {
    const trees = await prisma.tree.findMany(
        {
          select: {
            id: true,
            name: true,
            price: true,
            slug: true,
            species: true,
            description: true,
            url_image: true,
            available: true,
          },
          orderBy: { id: "asc" },
        }
      );

    expect(trees).toBeInstanceOf(Array);
  });


});

// Test pour mettre à jour un arbre test
const TEST_SLUG = "arbre-de-test";
const UPDATED_SLUG = "arbre-de-test-modifie";

describe("updateTree", () => {
//   Création d'un arbre dedié à chaque test
  beforeEach(async () => {
    await prisma.tree.create({
      data: {
        name: "Arbre de test",
        price: 20,
        slug: TEST_SLUG,
        species: "arborum-testum",
        description: "Création d'un arbre de test",
        url_image: "http://localhost/test.webp",
        available: true,
      },
    });
  });

  // Après chaque test : on supprime l'arbre, quel que soit son slug 
  afterEach(async () => {
    await prisma.tree.deleteMany({
      where: { slug: { in: [TEST_SLUG, UPDATED_SLUG] } },
    });
  });

  

  test("met à jour un arbre", async () => {
    let statusCode: number | undefined;
    // Le body renvoyé est un arbre Prisma (ou rien si json n'a pas été appelé)
    let responseBody: Tree | undefined;

    const req = {
      params: { slug: TEST_SLUG },
      body: {
        name: "Arbre de test modifié",
        price: 30,
        species: "arborum-testum",
        description: "Nouvelle description",
        available: "on",
      },
      file: undefined,

    } as unknown as Request<{ slug: string }>;

 
    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: unknown) {
        responseBody = data as Tree;
        return this;
      },
    } as unknown as Response;

    await treeController.updateTree(req, res);

    expect(statusCode).toBe(200);
    expect(responseBody?.name).toBe("Arbre de test modifié");
    expect(Number(responseBody?.price)).toBe(30);
    expect(responseBody?.slug).toBe(UPDATED_SLUG);
  });

  // À la fin : on ferme la connexion à la BDD
  afterAll(async () => {
    await prisma.$disconnect();
  });
});
