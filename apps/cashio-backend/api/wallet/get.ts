import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";

export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    const walletData = await bl.getBalance(userId);
    res.status(200).send(walletData);
  } catch (error) {
    next(error);
  }
};
