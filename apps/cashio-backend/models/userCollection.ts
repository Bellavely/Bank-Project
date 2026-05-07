import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    otp: { type: Number },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);


export const userCollection = mongoose.model("Users", userSchema);
