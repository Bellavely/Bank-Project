import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl/users";

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) return res.status(401).send("Unauthorized");
    res.send(await bl.getUserById(user.userId));


  } catch (error) {
    next(error);
  }
};
