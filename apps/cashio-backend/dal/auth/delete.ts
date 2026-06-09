import { prisma } from "../../prisma";

export const logOut = async (userId: string) => {
  return await prisma.refreshToken.delete({
    where: {
      userId: userId,
    },
  });
};
