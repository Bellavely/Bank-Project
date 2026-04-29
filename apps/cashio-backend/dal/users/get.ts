import { User } from "../../types";
import { userCollection } from "../../models";

export const getUserByEmail = async (email: string) => {
  return userCollection.findOne({ email }).lean<User>();
};

export const getUserById = async (id: string) => {
  return userCollection.findOne({ _id: id }).lean<User>();
};
