import type { Request, Response } from "express";
import argon2 from "argon2";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../lib/prisma.ts";
import { loginSchema, registerSchema, } from "../schemas/auth.schema.ts";

import { generateAuthenticationTokens, hashRefreshToken,   authenticationCookieOptions} from "../lib/token.ts";


import type { User } from "../../generated/prisma/client.js";

export const registerController = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Les données saisies sont invalides.",
    });
  }

  const { firstname, lastname, email, password } = result.data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return res.status(StatusCodes.CONFLICT).json({
      error: "Un utilisateur avec cette adresse email existe déjà.",
    });
  }

  const hashedPassword = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      firstname,
      lastname,
      email,
      password: hashedPassword,
    },
  });

  return res.status(StatusCodes.CREATED).json({
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
  });
};



export const loginController = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Les données saisies sont invalides.",
    });
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Email ou mot de passe incorrect.",
    });
  }

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
  return res.status(StatusCodes.UNAUTHORIZED).json({
    error: "Email ou mot de passe incorrect.",
  });
}
const { accessToken, refreshToken } = generateAuthenticationTokens(user);

await replaceRefreshTokenInDatabase(refreshToken, user);

return res.status(StatusCodes.OK).cookie(
  "accessToken",
  accessToken.token,
  {
    
  ...authenticationCookieOptions,
    maxAge: accessToken.expiresIn,
  },
).cookie("refreshToken", refreshToken.token, {
  
  ...authenticationCookieOptions,
  maxAge: refreshToken.expiresIn,
}).json({
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
  });;
};



interface Token {
  token: string;
  expiresIn: number;
}

async function replaceRefreshTokenInDatabase(
  refreshToken: Token,
  user: User,
)
// Supprime les anciens refresh tokens afin de ne conserver  qu'une seule session active par utilisateur.
 {await prisma.refreshToken.deleteMany({
  where: {
    user_id: user.id,
  },

});

await prisma.refreshToken.create({
  data: {
    token: hashRefreshToken(refreshToken.token),
    user_id: user.id,
    issued_at: new Date(),
    // Calcule la date d'expiration du refresh token à partir
// de sa durée de validité exprimée en millisecondes.
    expires_at: new Date(new Date().valueOf() + refreshToken.expiresIn),
  },
});
  
}


export const refreshController = async (req: Request, res: Response) => {
  const cookieReFreshToken = req.cookies.refreshToken;
  if (!cookieReFreshToken) {
  return res.status(StatusCodes.UNAUTHORIZED).json({
    error: "Aucun refresh token trouvé.",
  });
}
// Vérifie que le refresh token existe toujours en base
// et récupère l'utilisateur auquel il est associé, via include
const existingRefreshToken = await prisma.refreshToken.findUnique({
  where: {
    token: hashRefreshToken(cookieReFreshToken),
  },
  include: {
    user: true,
  },
});
if (!existingRefreshToken) {
  return res.status(StatusCodes.UNAUTHORIZED).json({
    error: "Refresh token invalide.",
  });
}
if (existingRefreshToken.expires_at < new Date()) {
  await prisma.refreshToken.delete({
  where: {
    id: existingRefreshToken.id,
  },
});
  return res.status(StatusCodes.UNAUTHORIZED).json({
    error: "Refresh token expiré.",
  });
}
// Génère une nouvelle paire de tokens (accesToken et refreshToken) et remplace l'ancien refresh token en base.
const { accessToken, refreshToken} = generateAuthenticationTokens(existingRefreshToken.user);
  await replaceRefreshTokenInDatabase(refreshToken,existingRefreshToken.user);
  return res
  .status(StatusCodes.OK)
  .cookie("accessToken", accessToken.token, {
    
  ...authenticationCookieOptions,
    maxAge: accessToken.expiresIn,
  })
  .cookie("refreshToken", refreshToken.token, {
    
  ...authenticationCookieOptions,
    maxAge: refreshToken.expiresIn,
  })
  .json({
    id: existingRefreshToken.user.id,
    firstname: existingRefreshToken.user.firstname,
    lastname: existingRefreshToken.user.lastname,
    email: existingRefreshToken.user.email,
    role: existingRefreshToken.user.role,
  }
  );
};

export const logoutController = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: {
        token: hashRefreshToken(refreshToken),
      },
    });
  }

  return res
    .status(StatusCodes.OK)
    .clearCookie("accessToken", authenticationCookieOptions)
    .clearCookie("refreshToken", authenticationCookieOptions)
    .json("Déconnexion réussie.");
};