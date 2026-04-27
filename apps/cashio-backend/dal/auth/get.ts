import { number } from "zod";
import { refreshTokens, wallets } from "../consts";

export const getRefreshTokenByUserId = (userId: number) => {
  return refreshTokens.find((val) => val.userId === userId)?.refreshToken;
};
