import { Transaction, transactions } from "../consts";

export const createTransaction = (data: Transaction) => {
  transactions.push(data);
};
