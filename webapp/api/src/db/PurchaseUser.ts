import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  destinationBlockchain: { type: String, required: true },
  investToken: { type: String, required: true },  // esto tiene q ser el id del bond en mongo
  purchasedTokens: { type: Number, required: true },
});

export const UserModel = mongoose.model("User", UserSchema);

export const getPurchaseUsers = () => UserModel.find();
export const getPurchasesById = (id: string) => UserModel.findById(id);
export const createPurchaseUser = (values: Record<string, any>) => new UserModel(values).save();
export const deletePurchaseUserById = (id: string) => UserModel.findOneAndDelete({ _id: id });
export const getRetailPurchasedByUserId = (userId: string) => UserModel.find({ userId });