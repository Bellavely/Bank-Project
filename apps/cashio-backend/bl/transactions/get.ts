import * as dal from "../../dal";
export const getAllTransactionsByUser = (
  userId: string,
  page: number,
  limit: number,
) => dal.getTransactionsByUser(userId, page, limit);
