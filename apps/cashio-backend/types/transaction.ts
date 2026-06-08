import { TransactionStatus } from "../prisma/generated/client/client";

export type UserRef = {
  _id: string;
  name: string;
  email: string;
};

export type TransactionDB = {
  senderId: string;
  reciverId: string;
  amount: number;
  message: string;
  status: TransactionStatus;
};

export type Transaction = {
  senderId: UserRef;
  receiverId: UserRef;
  amount: number;
  message: string;
  status: TransactionStatus;
  createdAt: string;
};
