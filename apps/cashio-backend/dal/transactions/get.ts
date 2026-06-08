import { prisma } from "apps/cashio-backend/prisma";
import { TransactionStatus } from "../../prisma/generated/client/client";
import { tr } from "zod/v4/locales";
export const getTransactionsByUser = async (
  userId: string,
  page: number,
  limit: number,
  status?: TransactionStatus,
) => {
  const offset = (page - 1) * limit;

  const transactions = await prisma.transaction.findMany({
    take: limit,
    skip: offset,
    where: {
      status: status,
    },
    include: {
      sender: {
        select: {
          fullName: true,
          email: true,
        },
      },
      receiver: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalCount = await prisma.transaction.count();
  const totalPages = Math.ceil(totalCount / limit);
  return { length: totalCount, data: transactions };
};

export const getTransactionById = async (transactionId: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
  });
  return { ...transaction, amount: transaction?.amount.toNumber() };
};
