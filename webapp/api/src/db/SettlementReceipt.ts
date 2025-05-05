const mongoose = require("mongoose");

// Define the Mongoose Schema for the FormData type
const SettlementReceiptSchema = new mongoose.Schema({
  settleToken: {type: String,required: true},
  settlementType: {type: String,enum: ["Maturity date", "Early redemption", "Partial redemption"],required: true},
  amountOf: {type: Number,required: false},
  distributionCriteria: {type: String,enum: ["FIFO", "Proportional"],required: false},
});

// Export the schema as a Mongoose model
export const SettlementReceiptModel = mongoose.model("SettlementReceipt", SettlementReceiptSchema);

export const getSettlementReceipts = () => SettlementReceiptModel.find();
export const getSettlementReceiptById = (id: string) => SettlementReceiptModel.findById(id);
export const createSettlementReceipt = (values: Record<string, any>) =>
  new SettlementReceiptModel(values).save();
export const deleteSettlementReceiptById = (id: string) =>
  SettlementReceiptModel.findOneAndDelete({ _id: id });

