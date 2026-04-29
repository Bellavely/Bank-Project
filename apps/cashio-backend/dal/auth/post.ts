import { refreshTokenCollection } from "apps/cashio-backend/models";
import mongoose from "mongoose";

export const addRefreshToken = async (userId: string, refreshToken: string) => {
  return refreshTokenCollection.create({ userId, refreshToken });
};

export const logOut = async (userId: string) => {
  const userIdObject = new mongoose.Types.ObjectId(userId);
  return refreshTokenCollection.findOneAndDelete({userId: userIdObject});
};
