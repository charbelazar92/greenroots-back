import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";


//Intercepte les erreurs inattendues qui n'ont pas été gérées
// directement dans les contrôleurs.
export const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
) => {
 //Si Express a déjà commencé à envoyer une réponse,
 // il transmet l'erreur à son gestionnaire d'erreurs par défaut.
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: "Une erreur interne est survenue.",
  });
};