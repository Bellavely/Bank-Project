import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl/users";

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    res.send(await bl.getUserById(Number(userId)));
  } catch (error) {
    next(error);
  }
};
