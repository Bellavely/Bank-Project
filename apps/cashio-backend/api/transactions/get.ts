import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
import { validatelimit, validatePage } from "../../validation";
import { TransactionStatus } from "apps/cashio-backend/types";

export const getAllTransactionsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    const limit = validatelimit.parse(req.query.limit);
    const page = validatePage.parse(req.query.page);
    const status = req.query.status;
    const statusEnum =
      typeof status === "string" &&
      Object.values(TransactionStatus).includes(status as TransactionStatus)
        ? (status as TransactionStatus)
        : undefined;
    if (!limit || !page) {
      return res.status(404).send({ message: "add param query" });
    }
    const getTransactions = await bl.getAllTransactionsByUser(
      userId,
      page,
      limit,
      statusEnum,
    );
    res.status(200).send({
      data: getTransactions.data,
      pagination: {
        total: getTransactions.length,
        page,
        limit,
        totalPages: Math.ceil(getTransactions.length / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
