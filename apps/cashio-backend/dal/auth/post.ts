import { prisma } from "../../prisma";

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
