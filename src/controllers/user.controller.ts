import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import argon2 from "argon2";

import { authenticationCookieOptions } from "../lib/token.ts";

import { prisma } from "../lib/prisma.ts";
import { updateUserSchema,  deleteUserSchema } from "../schemas/user.schema.ts";

export const updateUserController = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Vous devez être connecté pour modifier vos informations.",
    });
  }

  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: result.error.issues[0].message,
    });
  }

  const { firstname, lastname, email } = result.data;

  try {
    if (email !== undefined) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(StatusCodes.CONFLICT).json({
          error: "Un utilisateur avec cette adresse email existe déjà.",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        firstname,
        lastname,
        email,
      },
    });

    return res.status(StatusCodes.OK).json({
      id: updatedUser.id,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "La modification de vos informations a échoué. Veuillez réessayer.",
    });
  }
};



export const deleteUserController = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Vous devez être connecté pour supprimer votre compte.",
    });
  }

  const result = deleteUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: result.error.issues[0].message,
    });
  }

  const { password } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Votre compte est introuvable.",
      });
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "Le mot de passe actuel est incorrect.",
      });
    }


    // Si la suppression du compte échoue, la transaction empêche également
    // l'annulation des commandes afin de garder des données cohérentes.

    await prisma.$transaction(async (transaction) => {
  // Annule les commandes encore en attente
  await transaction.order.updateMany({
    where: {
      user_id: user.id,
      status: "pending",
    },
    data: {
      status: "cancelled",
    },
  });

  // Supprime ensuite le compte utilisateur
  await transaction.user.delete({
    where: {
      id: user.id,
    },
  });
});

    return res
      .status(StatusCodes.OK)
      .clearCookie("accessToken",  authenticationCookieOptions)
      .clearCookie("refreshToken",  authenticationCookieOptions)
      .json("Votre compte a bien été supprimé.");
  } catch {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "La suppression du compte a échoué. Veuillez réessayer.",
    });
  }
};