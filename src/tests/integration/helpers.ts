import type { Server } from "node:http";
import { app } from "../../app.ts";
import { prisma } from "../../lib/prisma.ts";

// Empêche les tests d'utiliser une autre base.
function checkTestEnvironment(): void {
    const url = new URL(process.env.DATABASE_URL ?? "");

    if (
        process.env.NODE_ENV !== "test" ||
        !["localhost", "127.0.0.1"].includes(url.hostname) ||
        url.port !== "5432" ||
        url.pathname !== "/greenroots_test"
    ) {
        throw new Error(
            "Les tests doivent utiliser la base locale greenroots_test.",
        );
    }
}

export const PORT = Number(process.env.PORT);
export const baseUrl = `http://127.0.0.1:${PORT}`;

// Démarre le serveur et attend qu'il soit prêt.
export function startServer(): Promise<Server> {
    checkTestEnvironment();

    if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
        throw new Error("Le PORT défini dans .env.test est invalide.");
    }

    return new Promise((resolve, reject) => {
        const server = app.listen(PORT, "127.0.0.1", () => {
            server.off("error", reject);
            resolve(server);
        });

        server.once("error", reject);
    });
}

// Arrête le serveur et ferme les connexions à PostgreSQL.
export async function stopServer(server: Server): Promise<void> {
    try {
        if (server.listening) {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });

                server.closeAllConnections();
            });
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Vide uniquement la base de test, dans l'ordre des dépendances.
export async function resetDatabase(): Promise<void> {
    checkTestEnvironment();

    await prisma.$transaction([
        prisma.orderTree.deleteMany(),
        prisma.order.deleteMany(),
        prisma.tree.deleteMany(),
        prisma.refreshToken.deleteMany(),
        prisma.user.deleteMany(),
    ]);
}