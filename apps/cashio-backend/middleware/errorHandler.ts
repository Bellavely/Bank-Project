import { Response, Request, NextFunction } from "express";
import path from "node:path";
import { ZodError } from "zod";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res
      .status(422)
      .send({ message: `${err.issues.map((issue) => issue.message)}` });
  }

  if (err instanceof Error) {
    res.status(500).json({ message: `Somthing went Wrong  + ${err.message}` });
  }

  res.status(500).json({ message: "Unknown error" });
};
