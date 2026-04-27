import * as dal from "../../dal/users";
//for future request its only a mock
export const getUserById = async (id: number) => {
  return await dal.getUserById(id);
};
