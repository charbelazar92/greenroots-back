import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// Charge explicitement les variables réservées aux tests.
const result = dotenv.config({
  path: ".env.test",
  override: true,
});

if (result.error) {
  throw new Error("Impossible de charger .env.test.");
}

// Vérifie la cible avant de charger l'application et les tests.
const databaseUrl = new URL(process.env.DATABASE_URL ?? "");

if (
  process.env.NODE_ENV !== "test" ||
  !["localhost", "127.0.0.1"].includes(databaseUrl.hostname) ||
  databaseUrl.port !== "5432" ||
  databaseUrl.pathname !== "/greenroots_test"
) {
  throw new Error(
    "Les tests doivent utiliser la base locale greenroots_test sur le port 5432.",
  );
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    fileParallelism: false,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});