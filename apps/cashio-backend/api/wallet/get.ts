import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
import { StatusCodes } from "http-status-codes";

export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    const walletData = await bl.getBalance(userId);
    res.status(StatusCodes.OK).send(walletData);
  } catch (error) {
    next(error);
  }
};
