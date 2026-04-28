import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, require: true, unique: true },
    fullname: { type: String, require: true },
    phone: { type: String, require: true },
    password: { type: String, require: true },
  },
  { timestamps: true },
);

export const userCollection = mongoose.model("Users", userSchema);
