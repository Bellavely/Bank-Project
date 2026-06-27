import { prisma } from "../../prisma";
import { TransactionStatus } from "@prisma/client";

export const getTransactionsByUser = async (
  userId: string,
  page: number,
  limit: number,
  status?: TransactionStatus | undefined,
  search?: string | undefined,
) => {
  const offset = (page - 1) * limit;
  const whereClause: any = {
    AND: [
      {
        OR: [
          {
            senderId: userId,
          },
          { reciverId: userId },
        ],
      },
    ],
  };

  if (status) {
    whereClause.AND.push({ status });
  } else {
    whereClause.AND.push({ status: { in: ["COMPLETED", "FAILED"] } });
  }

  if (search) {
    const searchOr: any[] = [
      { message: { contains: search, mode: "insensitive" } },
      { sender: { fullName: { contains: search, mode: "insensitive" } } },
      { sender: { email: { contains: search, mode: "insensitive" } } },
      { receiver: { fullName: { contains: search, mode: "insensitive" } } },
      { receiver: { email: { contains: search, mode: "insensitive" } } },
    ];

    const amountNum = parseFloat(search);
    if (!isNaN(amountNum)) {
      searchOr.push({ amount: amountNum });
    }

    whereClause.AND.push({ OR: searchOr });
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

  const totalCount = await prisma.transaction.count({
    where: whereClause,
  });
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
