import { transactionCollection } from "apps/cashio-backend/models";
import { TransactionDB } from "apps/cashio-backend/types";

export const createTransaction = ({
  senderId,
  receiverId,
  amount,
  message,
  status,
}: TransactionDB) => {
  return transactionCollection.create({
    senderId,
    receiverId,
    amount,
    message,
    status,
  });
};
