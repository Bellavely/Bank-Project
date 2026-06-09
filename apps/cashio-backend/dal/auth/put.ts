import { prisma } from "../../prisma";

export const UpdateToken = async (userId: string, newRefreshToken: string) => {
  await prisma.refreshToken.update({
    where: {
      userId,
    },
    data: {
      refreshToken: newRefreshToken,
    },
  });
};
