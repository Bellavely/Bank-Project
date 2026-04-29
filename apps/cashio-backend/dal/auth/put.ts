import mongoose from "mongoose";
import { refreshTokenCollection } from "../../models";

export const UpdateToken = async (userId: string, newRefreshToken: string) => {
  const userIdObject = new mongoose.Types.ObjectId(userId);

  await refreshTokenCollection.findOneAndUpdate(
    {
      userId: userIdObject,
    },
    { $set: { refreshToken: newRefreshToken } },
  );
};
