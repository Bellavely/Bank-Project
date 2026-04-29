import mongoose, { Mongoose } from "mongoose";

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  balance: { type: Number, require: true },
});

export const walletCollection = mongoose.model("Wallet", walletSchema);
