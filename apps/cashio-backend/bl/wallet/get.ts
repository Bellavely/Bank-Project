import * as dal from "../../dal";
export const getBalance = async(userId: string) => await dal.getBalance(userId);
