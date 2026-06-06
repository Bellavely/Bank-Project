import { prisma } from "../../prisma";
import { refreshTokenCollection } from "../../models";
import { RefreshToken } from "../../types";
import mongoose from "mongoose";

export const getRefreshTokenByUserId = (userId: string) => {
  // const userIdObject = new mongoose.Types.ObjectId(userId);
  // return refreshTokenCollection
  //   .findOne({ userId: userIdObject })
  //   .lean<RefreshToken>();
  return prisma.refreshToken.findUnique({
    where: {
      userId,
    },
  });
};
