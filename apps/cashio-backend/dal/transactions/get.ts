import { prisma } from "../../prisma";
import { TransactionStatus } from "@prisma/client";

export const getTransactionsByUser = async (
  userId: string,
  page: number,
  limit: number,
  status?: TransactionStatus | undefined,
) => {
  const offset = (page - 1) * limit;
  const whereClause: any = {
    OR: [
      {
        senderId: userId,
      },
      { reciverId: userId },
    ],
  };

  if (status) {
    whereClause.status = status;
  } else {
    whereClause.status = { in: ["COMPLETED", "FAILED"] };
  }

  const transactions = await prisma.transaction.findMany({
    take: limit,
    skip: offset,
    where: whereClause,
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
