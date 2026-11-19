import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { router } from "./routes/index.routes.ts";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.ts";
import { errorMiddleware } from "./middlewares/error.middleware.ts";


export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

