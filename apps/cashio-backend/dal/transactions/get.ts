import { transactionCollection } from "../../models";
import { Transaction } from "../../types";
import mongoose from "mongoose";
export const getTransactionsByUser = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const start = (page - 1) * limit;
  const userIdObject = new mongoose.Types.ObjectId(userId);

  const totalTransactions = await transactionCollection
    .find({
      $or: [{ senderId: userIdObject }, { receiverId: userIdObject }],
    })
    .countDocuments();
  if (totalTransactions === 0 || page > Math.ceil(totalTransactions / limit)) {
    throw new Error(`אין טרנזקציות בעמוד ${page}`);
  }

  const usersTransactions = await transactionCollection
    .find({
      $or: [{ senderId: userIdObject }, { receiverId: userIdObject }],
    })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .sort({ createdAt: -1 })
    .skip(start)
    .limit(limit)
    .lean<Transaction[]>();
  return { length: totalTransactions, data: usersTransactions };
};

export const getTransactionById = (transactionId: string) => {
  return transactionCollection
    .findOne({ _id: transactionId })
    .lean<Transaction>();
};
