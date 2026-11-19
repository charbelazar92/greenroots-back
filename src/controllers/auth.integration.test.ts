import { beforeAll, afterAll, test, expect } from "vitest";
import type { Server } from "node:http";

import { prisma } from "../lib/prisma.ts";

import {
  startServer,
  stopServer,
  resetDatabase,
  baseUrl,
} from "../tests/integration/helpers.ts";

let server: Server;

beforeAll(async () => {
  await resetDatabase();
  server = await startServer();
});

afterAll(async () => {
  try {
    await resetDatabase();
  } finally {
    await stopServer(server);
  }
});

test("POST /api/auth/register inscrit un utilisateur", async () => {
  const user = {
    firstname: "toto",
    lastname: "dupont",
    email: "toto.dupont@greenroots.fr",
    password: "Toto1234",
  };

  // Appelle  la route d'inscription.
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const returnedUser = await response.json();

  // Vérifie la réponse de l'API.
  expect(response.status).toBe(201);
  expect(returnedUser.firstname).toBe(user.firstname);
  expect(returnedUser.lastname).toBe(user.lastname);
  expect(returnedUser.email).toBe(user.email);
  expect(returnedUser.role).toBe("user");
 


  // Vérifie que l'API ne renvoie pas le mot de passe.
  expect(returnedUser).not.toHaveProperty("password");


  // Recherche l'utilisateur dans la BDD 
  const dbUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email, 
    },
  });


  // Vérifie les données enregistrées en base.
  expect(dbUser.firstname).toBe(user.firstname);
  expect(dbUser.lastname).toBe(user.lastname);
  expect(dbUser.email).toBe(user.email);
  expect(dbUser.role).toBe("user");

  // Vérifie que le mot de passe n'est pas enregistré en clair.
  expect(dbUser.password).not.toBe(user.password);
});