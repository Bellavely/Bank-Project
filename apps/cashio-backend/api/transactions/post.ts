import { validateTransfer } from "../../validation";
import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";

export const transferMoney = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(404).send({ message: "somthing went wrong" });
    }
    const { reciverEmail, amount } = validateTransfer.parse(req.params);
    res.status(200).send(bl.transferMoney(userId, reciverEmail, amount));
  } catch (error) {
    next(error);
  }
};
