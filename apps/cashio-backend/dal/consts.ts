import { User } from "libs/shared/types";

type Token = {
  userId: number;
  refreshToken: string;
};

type Wallet = {
  userId: number;
  balance: number;
};
export const users: User[] = [];
export const refreshTokens: Token[] = [];
export const wallets: Wallet[] = [];
