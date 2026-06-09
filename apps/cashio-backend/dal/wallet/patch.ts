import { prisma } from "apps/cashio-backend/prisma";

export const updateUsersBalance = async (userId: string, amount: number) => {
  await prisma.wallet.update({
    where: {
      userId: userId,
    },
    data: {
      balance: {
        increment: amount,
      },
    },
  });
};
