import { transactionCollection } from "../../models";
import { Transaction } from "../../types";

export const createTransaction = ({
  senderId,
  receiverId,
  amount,
  message,
  status,
}: Transaction) => {
  return transactionCollection.create({
    senderId,
    receiverId,
    amount,
    message,
    status,
  });
};
