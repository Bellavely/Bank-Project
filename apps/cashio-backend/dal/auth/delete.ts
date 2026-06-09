import { prisma } from "apps/cashio-backend/prisma";

export const logOut = async (userId: string) => {
  return await prisma.refreshToken.delete({
    where: {
      userId: userId,
    },
  });
};
