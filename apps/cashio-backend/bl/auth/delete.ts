import * as dal from "../../dal";

export const logOut = async (userId: string) => await dal.logOut(userId);
