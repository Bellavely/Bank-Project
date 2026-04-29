import { walletCollection } from "../../models";
import mongoose from "mongoose";
import { Wallet } from "../consts";

export const getBalance = async (userId: string) => {
  const userIdObject = new mongoose.Types.ObjectId(userId);
  return walletCollection.findOne({ userId: userIdObject }).lean<Wallet>();
};