export type SentTransaction = {
  receiverEmail: string;
  amount: number;
  message: string;
};

export type UserRef = {
  fullName: string;
  email: string;
};

export type Transaction = {
  id: string;
  senderId: string;
  receiverId: string;
  sender: UserRef;
  receiver: UserRef;
  amount: number;
  message: string;
  status: string;
  createdAt: string;
};
