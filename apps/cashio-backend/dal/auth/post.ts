import { prisma } from "apps/cashio-backend/prisma";

export const addRefreshToken = async (
  userId: string,
  refreshToken: string,
  expiresAt: Date,
) => {
  return await prisma.refreshToken.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
    },
  });
};


