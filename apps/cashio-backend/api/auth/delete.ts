import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
import { StatusCodes } from "http-status-codes";

export const logOut = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    await bl.logOut(userId);
    res.status(StatusCodes.OK).json("user logged out");
  } catch (error) {
    next(error);
  }
};
