import { prisma } from "../../prisma";

export const getBalance = async (userId: string) => {
  const wallet = await prisma.wallet.findUnique({
    where: {
      userId,
    },
  });
  return { ...wallet, balance: wallet?.balance.toNumber() };
};
