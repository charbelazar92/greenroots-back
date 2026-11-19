import type { NextFunction, Request, Response } from "express";

export const handleUploadError = (err: unknown, req: Request, res: Response, next: NextFunction) =>{
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
}