export type SentTransaction = {
  receiverEmail: string;
  amount: number;
  message: string;
};

export type UserRef = {
  _id: string;
  name: string;
  email: string;
};

export type Transaction = {
  _id: string;
  senderId: UserRef;
  receiverId: UserRef;
  amount: number;
  message: string;
  status: string;
  createdAt: string;
};
