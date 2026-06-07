import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "apps/cashio-backend/prisma";

export const updateUsersBalance = async (userId: string, amount: Decimal) => {
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
