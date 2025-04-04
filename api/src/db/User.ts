import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  destinationBlockchain: { type: String, required: true },
  investToken: { type: String, required: true },
  purchasedTokens: { type: Number, required: true },
});

export const UserModel = mongoose.model("User", UserSchema);

export const getUsers = () => UserModel.find();
export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = (values: Record<string, any>) => new UserModel(values).save();
export const deleteUserById = (id: string) => UserModel.findOneAndDelete({ _id: id });