import { prisma } from "apps/cashio-backend/prisma";

export const addRefreshToken = async (
  userId: string,
  refreshToken: string,
  expiresAt: Date,
) => {
  // return refreshTokenCollection.create({ userId, refreshToken });
  return prisma.refreshToken.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
    },
  });
};

export const logOut = async (userId: string) => {
  // const userIdObject = new mongoose.Types.ObjectId(userId);
  // return refreshTokenCollection.findOneAndDelete({ userId: userIdObject });
  return prisma.refreshToken.delete({
    where: {
      userId: userId,
    },
  });
};
