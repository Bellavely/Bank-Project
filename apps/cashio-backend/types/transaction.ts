import { TransactionStatus } from ".";

export type Transaction = {
  senderId: string;
  receiverId: string;
  amount: number;
  message: string;
  status: TransactionStatus;
};
