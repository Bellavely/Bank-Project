import { refreshTokens } from "../consts";

export const addRefreshToken = (userId: number, refreshToken: string) => {
  return refreshTokens.push({ userId, refreshToken });
};
