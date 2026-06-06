import { prisma } from "apps/cashio-backend/prisma";

export const getBalance = async (userId: string) => {
  return await prisma.wallet.findUnique({
    where: {
      userId,
    },
  });
};
