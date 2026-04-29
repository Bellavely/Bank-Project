import mongoose from "mongoose";
import { transactionCollection } from "../../models";
import { TransactionStatus } from "../consts";
import { getTransactionById } from "./get";
import { updateUsersBalance } from "../wallet";

export const updateTransaction = async (
  transactionId: string,
  status: TransactionStatus,
) => {
  const transactionObjectId = new mongoose.Types.ObjectId(transactionId);
  await transactionCollection.findOneAndUpdate(
    { _id: transactionObjectId },
    { $set: { status } },
  );
};

export const transferMoney = async (transactionId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transaction = await getTransactionById(transactionId);
    if (!transaction) throw new Error("transaction does not exists");
    await updateUsersBalance(transaction.senderId, -transaction.amount);
    await updateUsersBalance(transaction.receiverId, transaction.amount);
    await updateTransaction(transactionId, TransactionStatus.DONE);
  } catch (error) {
    console.error(`something went wrong  ${error}`);
  } finally {
    session.abortTransaction();
  }
};
