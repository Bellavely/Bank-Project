import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl/users";
import { StatusCodes } from "http-status-codes";

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId)
      return res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized");
    res.send(await bl.getUserById(user.userId));
  } catch (error) {
    next(error);
  }
};
