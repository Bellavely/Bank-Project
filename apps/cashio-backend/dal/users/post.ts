import { User } from "libs/shared/types";
import { refreshTokens, users } from "../consts";

export const register = ({
  fullname: fullName,
  password,
  email,
  phone: phoneNumber,
}: User) => {
  const id = users.length;
  return (
    users.push({
      id,
      fullname: fullName,
      email,
      password,
      phone: phoneNumber,
    }) - 1
  );
};
