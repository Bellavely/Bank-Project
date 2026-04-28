import { validateTransfer } from "../../validation";
import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";

export const transferMoney = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    const { receiverEmail, amount, message } = validateTransfer.parse(req.body);
    const data = await bl.transferMoney(userId, message, receiverEmail, amount);
    res.send(data);
  } catch (error) {
    next(error);
  }
};
