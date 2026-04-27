import { refreshTokens } from "../consts";

export const getRefreshTokenByUserId = (userId: number) => {
  return refreshTokens.find((val) => val.userId === userId)?.refreshToken;
};
