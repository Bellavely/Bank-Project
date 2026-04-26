import { User } from "libs/shared/types";
import { users } from "../consts";

export const register = ({ fullName, password, email, phoneNumber }: User) => {
  const id = users.length;
  return users.push({ id, fullName, email, password, phoneNumber }) - 1;
};
