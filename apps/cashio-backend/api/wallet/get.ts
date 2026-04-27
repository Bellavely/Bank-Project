import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";

export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //ToDo : try not using as any
    const { userId } = (req as any).user;
    res.status(200).send(bl.getBalance(userId));
  } catch (error) {
    next(error);
  }
};
