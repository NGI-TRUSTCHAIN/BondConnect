// Archivo: models/BondDraftModel.ts
import mongoose from "mongoose";

const BondDraftSchema = new mongoose.Schema({
  bondName: { type: String, required: false, unique: true },
  bondMaturityDate: { type: Date, required: false },
  bondPurpose: { type: String, required: false },
  interestRate: { type: Number, required: false },
  paymentFreq: { type: String, required: false },
  goalAmount: { type: Number, required: false },
  numberTokens: { type: Number, required: false },
  earlyRedemptionClauses: { type: String, required: false },
  penalty: { type: Number, required: false },
  redemptionPeriods: { type: String, required: false },
  redemptionStartDate: { type: Date, required: false },
  redemptionFinishDate: { type: Date, required: false },
  blockchainNetwork: { type: String, required: false },
  otherBlockchainNetwork: { type: String, required: false },
  walletAddress: { type: String, required: false },
});

export const BondDraftModel = mongoose.model("BondDraft", BondDraftSchema);

export const getDraftBonds = () => BondDraftModel.find();
export const getDraftBondById = (id: string) => BondDraftModel.findById(id);
export const saveBond = (values: Record<string, any>) =>
  new BondDraftModel(values).save();
export const deleteDraftBondById = (id: string) =>
  BondDraftModel.findOneAndDelete({ _id: id });

