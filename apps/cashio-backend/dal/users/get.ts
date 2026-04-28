import { userCollection } from "../../models";

export const getUserByEmail = async (email: string) => {
  return userCollection.findOne({ email });
};

export const getUserById = async (id: string) => {
  return userCollection.find({ _id: id });
};
