import type { User } from "../../generated/prisma/client.ts";

// Étend le type Request d'Express pour rendre l'utilisateur authentifié accessible 
// dans l'application, sans exposer son mot de passe.
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password">;
    }
  }
}