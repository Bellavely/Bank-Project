import { User } from "libs/shared/types";

export type RefreshToken = {
  userId: string;
  refreshToken: string;
};

export type Wallet = {
  userId: number;
  balance: number;
};

export enum TransactionStatus {
  DONE = "בוצע",
  WAITING = "ממתין",
  CANCELED = "בוטל",
}

export enum TransactionType {
  "הפקדה",
  "העברה",
}

export type Transaction = {
  senderId: string;
  receiverId: string;
  amount: number;
  message: string;
  status: TransactionStatus;
};

export const users: User[] = [];
export const wallets: Wallet[] = [];
export const transactions: Transaction[] = [];
