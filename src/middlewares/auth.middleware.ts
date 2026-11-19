import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../lib/prisma.js";


// Vérifie que l'utilisateur est authentifié avant d'accéder à une route protégée.

export const verifyAuth = async (req: Request,res: Response,next: NextFunction,) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Vous n'êtes pas connecté.",
    });
  }

  try {
    // Vérifie l'authenticité et l'expiration du token, puis récupère son payload.
    const payload = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!,
    ) as JwtPayload;

    // Vérifie que l'utilisateur du token existe toujours, sans récupérer son mot de passe.
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      omit: {
        password: true,
      },
    });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "L'utilisateur n'existe pas.",
      });
    }

    // Rend l'utilisateur authentifié accessible aux middlewares et contrôleurs suivants.
    req.user = user;
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Le token est invalide ou expiré.",
    });
  }

  next();
};

// Vérifie que l'utilisateur authentifié possède le rôle administrateur.

export const verifyAdmin = ( req: Request, res: Response, next: NextFunction,) => {
  if (req.user?.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: "Accès réservé aux administrateurs.",
    });
  }

  next();
};