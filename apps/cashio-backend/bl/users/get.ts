import * as dal from "../../dal";
export const getUserById = async (id: string) => {
  return await dal.getUserById(id);
};

export const getUserByEmail = async (email: string) => {
  return await dal.getUserByEmail(email);
};
