import mongoose from "mongoose";

export interface IBond {
  _id?: mongoose.Types.ObjectId;
  bondName: string;
  bondSymbol: string;
  bondStartDate: Date;
  bondMaturityDate: Date;
  bondPurpose: string;
  interestRate: number;
  paymentFreq: "Monthly" | "Quarterly" | "Semi-annualy" | "Annualy";
  goalAmount: number;
  numberTokens: number;
  price: number;
  earlyRedemptionClauses: "yes" | "no";
  penalty?: number;
  redemptionStartDate?: Date;
  redemptionFinishDate?: Date;
  blockchainNetwork: "ALASTRIA" | "AMOY";
  tokenState: Array<{blockchain: string, amount: number, contractAddress?: string}>;
  creatorCompany: string;
  contractAddress?: string;
}

// Define the Mongoose Schema for the FormData type
const BondSchema = new mongoose.Schema({
  bondName: {type: String,required: true},
  bondSymbol: {type: String,required: true, unique: true},
  bondStartDate: {type: Date,required: true},
  bondMaturityDate: {type: Date,required: true},
  bondPurpose: {type: String,required: true},
  interestRate: {type: Number,required: true},
  paymentFreq: {type: String,enum: ["Monthly", "Quarterly", "Semi-annualy", "Annualy"],required: true,},
  goalAmount: {type: Number,required: true},
  numberTokens: {type: Number,required: true},
  price: {type: Number,required: true},
  earlyRedemptionClauses: {type: String,enum: ["yes", "no"], required: true,},
  penalty: {type: Number, required: function () {return this.earlyRedemptionClauses === "yes";}},
  redemptionStartDate: {type: Date, required: function () {return this.earlyRedemptionClauses === "yes";}},
  redemptionFinishDate: {type: Date, required: function () {return this.earlyRedemptionClauses === "yes";}},
  blockchainNetwork: {type: String,enum: ["ALASTRIA", "AMOY"], required: true},
  tokenState: [
    {blockchain: {type: String, required:true}, amount: {type: Number, required:true}, contractAddress:{type: String}}
  ],
  creatorCompany: {type: String, required: true},
  contractAddress: {type: String}
});
BondSchema.index({ bondName: 1 }, { unique: true });

// Export the schema as a Mongoose model
export const BondModel = mongoose.model("Bond", BondSchema);

export const getBonds = () => BondModel.find();
export const getBondById = (id: string) => BondModel.findById(id);
export const getBondByBondName = (bondName: string) => BondModel.findOne({ bondName: bondName });
export const createBond = (values: Record<string, any>) =>
  new BondModel(values).save();
export const deleteBondById = (id: string) =>
  BondModel.findOneAndDelete({ _id: id });
export const updateBondById = (id: string, update: Partial<IBond>) =>
  BondModel.findByIdAndUpdate(id, update, { new: true });

