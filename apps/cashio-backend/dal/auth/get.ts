import { refreshTokenCollection } from "apps/cashio-backend/models";
import { RefreshToken } from "../consts";
import mongoose from "mongoose";

export const getRefreshTokenByUserId = (userId: string) => {
  const userIdObject = new mongoose.Types.ObjectId(userId);
  return refreshTokenCollection
    .findOne({ userId: userIdObject })
    .lean<RefreshToken>();
};
