import mongoose from "mongoose";
import { TransactionStatus } from "../dal/consts";

const transactionsSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    amount: { type: Number, require: true },
    message: { type: String, require: true },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      require: true,
    },
  },
  { timestamps: true },
);

export const transactionCollection = mongoose.model(
  "Transactions",
  transactionsSchema,
);
