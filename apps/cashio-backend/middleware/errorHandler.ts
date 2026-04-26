import { Response, Request, NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof Error) {
    console.log(err.message);
    res.status(401).json({ message: `Somthing went Wrong  + ${err.message}` });
  }

  res.status(500).json({ message: "Unknown error" });
};
