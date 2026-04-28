import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const uri = process.env.MONGO_URI!;
    await mongoose.connect(uri);
    console.log(`MongoDb connected`);
  } catch (error) {
    console.error(`db connection error: ${error}`);
  }
};
