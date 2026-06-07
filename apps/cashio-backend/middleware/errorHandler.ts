import { Response, Request, NextFunction } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/notFoundError";
import { Prisma } from "../prisma/generated/client/client";

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
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = (err.meta?.target as string[])?.join(", ") || "field";
        res.status(409).json({
          status: "fail",
          error: "Unique constraint violation",
          message: `The ${target} you entered is already registered.`,
        });
      }
      case "P2003":
        res.status(400).json({
          status: "fail",
          error: "Foreign key failure",
          message:
            "A related record required for this operation was not found.",
        });
      case "P2025":
        res.status(404).json({
          status: "fail",
          error: "Not Found",
          message: "The record you are trying to modify does not exist.",
        });
      default:
        res.status(500).json({
          status: "error",
          error: `Database Error (${err.code})`,
          message: "An unexpected database error occurred.",
        });
    }
  }

  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: "Unknown error" });
};
