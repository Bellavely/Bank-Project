import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
import { validatelimit, validatePage } from "apps/cashio-backend/validation";

export const getAllTransactionsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).userId;
    if (userId) {
      res
        .status(404)
        .send({ message: "somthing gone wrong try to refresh the page" });
    }
    const limit = validatelimit.parse(req.query.limit);
    const page = validatePage.parse(req.query.page);
    if (!limit || !page) {
      res.status(404).send({ message: "add param query" });
    }
    const getTransactions = bl.getAllTransactionsByUser(userId, page, limit);
    res.status(200).send({
      date: getTransactions.data,
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
