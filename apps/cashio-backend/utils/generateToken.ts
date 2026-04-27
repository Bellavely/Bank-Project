import { User } from "libs/shared/types";
import jwt from "jsonwebtoken";

export const generateTokens = ({ fullname: fullName, id }: User) => {
  const accessToken = jwt.sign(
    { userId: id, fullName },
    process.env.ACCESS_SECRET!,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign({ userId: id }, process.env.REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  return {
    accessToken,
    refreshToken,
  };
};
