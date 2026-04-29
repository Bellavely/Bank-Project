import { transactionCollection } from "apps/cashio-backend/models";
import { Transaction } from "../consts";

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
