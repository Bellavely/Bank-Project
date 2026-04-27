import { User } from "libs/shared/types";

type Token = {
  userId: number;
  refreshToken: string;
};
export const users: User[] = [];
export const refreshTokens: Token[] = [];
