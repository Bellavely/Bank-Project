import { Response, Request, NextFunction } from "express";
import path from "node:path";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { AppError, NotFoundError } from "../utils/notFoundError";
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).send({
      message: `${err.issues.map((issue) => `${issue.input}:${issue.message}`)}`,
    });
    console.error("Validation error:", err);
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: "Unknown error" });
};
