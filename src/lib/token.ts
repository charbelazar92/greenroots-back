import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";

import type { User } from "../../generated/prisma/client.ts";

export function generateAuthenticationTokens(user: User) {
    // Le userId est placé dans le payload afin d'identifier l'utilisateur
  // lors de la vérification du JWT, sans avoir à l'envoyer depuis le frontend.
  const payload = {
    userId: user.id,
  };

   // L'access token est signé avec le secret de l'application et expire rapidement.
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });

   // Le refresh token est une valeur aléatoire : il ne contient aucune donnée utilisateur.
  const refreshToken = crypto.randomBytes(128).toString("base64");

  return {
    accessToken: {
      token: accessToken,
      expiresIn: 15 * 60 * 1000,
    },
    refreshToken: {
      token: refreshToken,
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    },
  };
}


const isProduction = process.env.NODE_ENV === "production";

// Options communes aux cookies d'authentification.
export const authenticationCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  path: "/",
};


export function hashRefreshToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}





