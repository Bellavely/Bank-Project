import * as dal from "../../dal/users";
export const getUserById = async (id: string) => {
  return await dal.getUserById(id);
};
