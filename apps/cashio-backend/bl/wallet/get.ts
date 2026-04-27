import * as dal from "../../dal";
export const getBalance = (userId: number) => dal.getBalance(userId);
