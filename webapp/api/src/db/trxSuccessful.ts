import mongoose from "mongoose";

export interface ITrxSuccessful {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  timestamp: Date;
  network: string;
  trx_type: "purchaseBond" | "redeemBond" | "callContractMethodController" | "executeContractMethodController" | "mintBond" | "bridge" | "burn" | "createBond" | "requestTransfer" | "balance" | "getFaucetBalance" | "faucet" | "requestStable" | "createAccountMultiple" | "createIndividualAccountRetry";
  trx: string;
}

const TrxSuccessfulSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  network: { type: String, required: true },
  trx_type: {type: String,enum: ["purchaseBond", "redeemBond", "callContractMethodController", "executeContractMethodController", "mintBond", "bridge", "burn", "createBond", "requestTransfer", "balance", "getFaucetBalance", "faucet", "requestStable", "createAccountMultiple", "createIndividualAccountRetry"],required: true,},
  trx: { type: String, required: true }
}, {
  timestamps: true
});

// Índice para búsquedas por userId
TrxSuccessfulSchema.index({ userId: 1 });

export const TrxSuccessfulModel = mongoose.model<ITrxSuccessful>("TrxSuccessful", TrxSuccessfulSchema); 

export const createTrxSuccessful = (values: Record<string, any>) => new TrxSuccessfulModel(values).save();
export const getTrxSuccessfulByUserId = (userId: string) => TrxSuccessfulModel.find({ userId: userId });
export const updateTrxSuccessfulById = (id: string, update: Partial<ITrxSuccessful>) => TrxSuccessfulModel.findByIdAndUpdate(id, update, { new: true });
export const deleteTrxSuccessfulById = (id: string) => TrxSuccessfulModel.findByIdAndDelete(id);
