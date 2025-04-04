import mongoose from "mongoose";

const SaleReceiptSchema = new mongoose.Schema({
  selledToken: { type: String, required: true },
  selledAmount: { type: Number, required: true },
  pricePerToken: { type: Number, required: true },
  saleType: { type: String, required: true },
});

export const SaleReceiptModel = mongoose.model("SaleReceipt", SaleReceiptSchema);

export const getSaleReceipts = () => SaleReceiptModel.find();
export const getSaleReceiptById = (id: string) => SaleReceiptModel.findById(id);
export const createSaleReceipt = (values: Record<string, any>) => new SaleReceiptModel(values).save();
export const deleteSaleReceiptById = (id: string) => SaleReceiptModel.findOneAndDelete({ _id: id });
