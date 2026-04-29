import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
import { validatelimit, validatePage } from "apps/cashio-backend/validation";

export const getAllTransactionsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    const limit = validatelimit.parse(req.query.limit);
    const page = validatePage.parse(req.query.page);
    if (!limit || !page) {
      res.status(404).send({ message: "add param query" });
    }
    const getTransactions = await bl.getAllTransactionsByUser(userId, page, limit);
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
