import { User } from "libs/shared/types";
import jwt from "jsonwebtoken";

export const generateTokens = ({ fullname: fullName, _id }: User) => {
  const accessToken = jwt.sign(
    { userId: _id, fullName },
    process.env.ACCESS_SECRET!,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign({ userId: _id }, process.env.REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  return {
    accessToken,
    refreshToken,
  };
};
