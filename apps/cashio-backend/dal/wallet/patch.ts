import mongoose from "mongoose";
import { walletCollection } from "../../models";

export const updateUsersBalance = async (userId: string, amount: number) => {
  const userIdObject = new mongoose.Types.ObjectId(userId);
  await walletCollection.findOneAndUpdate(
    { userId:userIdObject, balance: { $gte: amount } },
    { $inc: { balance: amount } },
  );
};
