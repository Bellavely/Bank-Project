import { prisma } from "../../prisma";
import { TransactionDB } from "../../types";

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
