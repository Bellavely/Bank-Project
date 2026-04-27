import { refreshTokens } from "../consts";

export const UpdateToken = (userId: number, newRefreshToken: string) => {
  refreshTokens.map((data) =>
    data.userId === userId ? (data.refreshToken = newRefreshToken) : data,
  );
};
