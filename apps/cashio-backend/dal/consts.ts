import { User } from "libs/shared/types";

type Token = {
  userId: number;
  refreshToken: string;
};

type Wallet = {
  userId: number;
  balance: number;
};

type Transaction = {
  senderId: number;
  receiverId: number;
  createdAt: string;
  amount: number;
  message: string;
};

export const users: User[] = [];
export const refreshTokens: Token[] = [];
export const wallets: Wallet[] = [];
export const transactions: Transaction[] = [];
