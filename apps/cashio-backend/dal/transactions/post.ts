import { transactionCollection } from "apps/cashio-backend/models";
import { prisma } from "apps/cashio-backend/prisma";
import { TransactionDB } from "apps/cashio-backend/types";

export const createTransaction = ({
  senderId,
  reciverId,
  amount,
  message,
  status,
}: TransactionDB) => {
  return prisma.transaction.create({
    data: {
      senderId,
      reciverId,
      amount,
      message,
      status,
    },
  });
};
