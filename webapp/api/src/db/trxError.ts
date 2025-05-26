import mongoose from "mongoose";

export interface ITrxError {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  timestamp: Date;
  network: string;
  trx_type: "purchaseBond" | "redeemBond" | "callContractMethodController" | "executeContractMethodController" | "mintBond" | "bridge" | "burn" | "createBond" | "requestTransfer" | "balance" | "getFaucetBalance" | "faucet" | "requestStable" | "createAccountMultiple" | "createIndividualAccountRetry";
  data: any;
}

const TrxErrorSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  network: { type: String, required: true },
  trx_type: {type: String,enum: [ "purchaseBond", "redeemBond", "callContractMethodController", "executeContractMethodController", "mintBond", "bridge", "burn", "createBond", "requestTransfer", "balance", "getFaucetBalance", "faucet", "requestStable", "createAccountMultiple", "createIndividualAccountRetry"],required: true,},
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, {
  timestamps: true
});
TrxErrorSchema.index({ userId: 1 }, { unique: true });

// Exportar el modelo
export const TrxErrorModel = mongoose.model<ITrxError>('TrxError', TrxErrorSchema); 

export const createTrxError = (values: Record<string, any>) => new TrxErrorModel(values).save();
export const getTrxErrorByUserId = (userId: string) => TrxErrorModel.find({ userId: userId });
export const updateTrxErrorById = (id: string, update: Partial<ITrxError>) => TrxErrorModel.findByIdAndUpdate(id, update, { new: true });
export const deleteTrxErrorById = (id: string) => TrxErrorModel.findByIdAndDelete(id);
