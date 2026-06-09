import mongoose from "mongoose";
import { getTransactionById } from "./get";
import { updateUsersBalance } from "../wallet";
import { prisma } from "apps/cashio-backend/prisma";
import { TransactionStatus } from "../../prisma/generated/client/client";
import { AppError } from "apps/cashio-backend/utils";
import { StatusCodes } from "http-status-codes";

export const updateTransaction = async (
  transactionId: string,
  status: TransactionStatus,
) => {
  await prisma.transaction.update({
    where: {
      id: transactionId,
    },
    data: {
      status: {
        set: status,
      },
    },
  });
};

export const transferMoney = async (transactionId: string) => {
  await prisma.$transaction(async (tx) => {
    const transfer = await tx.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transfer) {
      throw new AppError(StatusCodes.NOT_FOUND, "Transfer request not found");
    }
    const transaction = { ...transfer, amount: transfer.amount.toNumber() };
    if (transfer.status !== "PENDING") {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Transfer cannot be accepted because it is already ${transfer.status}`,
      );
    }
    await updateUsersBalance(transaction.senderId, -transaction.amount);
    await updateUsersBalance(transaction.reciverId, transaction.amount);
    await updateTransaction(transactionId, "COMPLETED");
  });
};
