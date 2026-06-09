import jwt from "jsonwebtoken";
import { User } from "../types";

export const generateTokens = ({ fullName, id }: User) => {
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
