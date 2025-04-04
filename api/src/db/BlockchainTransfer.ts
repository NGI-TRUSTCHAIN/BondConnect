import mongoose from "mongoose";

const TransferSchema = new mongoose.Schema({
  tokenName: { type: String, required: true },
  tokenNumber: { type: Number, required: true },
  destinationBlockchain: { type: String, required: true },
  originBlockchain: { type: String, required: true },
});

export const TransferModel = mongoose.model("BlockchainTransfer", TransferSchema);

export const getTransferData = () => TransferModel.find();
export const getTransferDataById = (id: string) => TransferModel.findById(id);
export const createTransferData = (values: Record<string, any>) => new TransferModel(values).save();
export const deleteTransferDataById = (id: string) => TransferModel.findOneAndDelete({ _id: id });
