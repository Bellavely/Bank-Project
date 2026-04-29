import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    refreshToken: { type: String, require: true },
  },
  { timestamps: true },
);

export const refreshTokenCollection = mongoose.model(
  "RefreshTokens",
  refreshTokenSchema,
);
