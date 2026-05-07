import { validateTransactionId, validateTransfer } from "../../validation";
import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
import { StatusCodes } from "http-status-codes";

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    const { receiverEmail, amount, message } = validateTransfer.parse(req.body);
    const data = await bl.createTransaction(
      userId,
      message,
      receiverEmail,
      amount,
    );
    res.status(StatusCodes.CREATED).send(data);
  } catch (error) {
    next(error);
  }
};

export const acceptTransactoin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = validateTransactionId.parse(req.params.id);
    res.status(StatusCodes.OK).send(await bl.acceptTransaction(id));
  } catch (error) {
    next(error);
  }
};

export const rejectTransactoin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = validateTransactionId.parse(req.params.id);
    res.status(StatusCodes.OK).send(await bl.rejectTransaction(id));
  } catch (error) {
    next(error);
  }
};
