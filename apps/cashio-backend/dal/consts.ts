import { User } from "libs/shared/types";

export type RefreshToken = {
  userId: string;
  refreshToken: string;
};

type Wallet = {
  userId: number;
  balance: number;
};

export type Transaction = {
  senderId: number;
  receiverId: number;
  createdAt: string;
  amount: number;
  message: string;
};

export const users: User[] = [];
export const wallets: Wallet[] = [];
export const transactions: Transaction[] = [];
