import { users } from "../consts";

export const getUserByEmail = async (email: string) => {
  return users.find((user) => user.email === email) || null;
};

export const getUserById = async (id: number) => {
  return users.find((user) => user.id === id);
};
