import { transactions } from "../consts";
export const getTransactionsByUser = (
  userId: number,
  page: number,
  limit: number,
) => {
  const start = (page - 1) * limit;
  const end = page * limit;
  const usersTransactions = transactions.filter(
    (value) => value.senderId === userId || value.receiverId === userId,
  );
  const totalPages = Math.ceil(usersTransactions.length / limit);
  if (page > totalPages) {
    throw new Error(`אין טרנזקציות בעמוד ${page}`);
  }
  const data = usersTransactions.slice(start, end);

  return { length: usersTransactions.length, data };
};
