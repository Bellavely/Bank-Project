import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl/users";

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    if (!userId ) res.status(401).send("somthing went wrong");
    res.send(await bl.getUserById(userId));
  } catch (error) {
    next(error);
  }
};
