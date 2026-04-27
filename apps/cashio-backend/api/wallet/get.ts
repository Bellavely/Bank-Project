import { Response, Request, NextFunction } from "express";

export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).send("balance route");
  } catch (error) {
    next(error);
  }
};
