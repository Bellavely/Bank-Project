import { prisma } from "apps/cashio-backend/prisma";

export const addRefreshToken = async (
  userId: string,
  refreshToken: string,
  expiresAt: Date,
) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
    },
  });
};

export const logOut = async (userId: string) => {
  return prisma.refreshToken.delete({
    where: {
      userId: userId,
    },
  });
};
