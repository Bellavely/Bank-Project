import { prisma } from "../../prisma";

export const getRefreshTokenByUserId = (userId: string) => {

  return prisma.refreshToken.findUnique({
    where: {
      userId,
    },
  });
};
