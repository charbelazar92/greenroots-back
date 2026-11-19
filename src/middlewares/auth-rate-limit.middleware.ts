import { rateLimit } from "express-rate-limit";

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  },
});


export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 4,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Trop de tentatives d'inscription. Veuillez réessayer plus tard.",
  },
});


export const deleteAccountRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Trop de tentatives de suppression. Veuillez réessayer dans 15 minutes.",
  },
});



export const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Trop de demandes de renouvellement. Veuillez réessayer dans 15 minutes.",
  },
});