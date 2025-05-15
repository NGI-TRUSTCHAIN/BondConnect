const mongoose = require("mongoose");

// Define the Mongoose Schema for the FormData type
const BondSchema = new mongoose.Schema({
  bondName: {type: String,required: true, unique: true},
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
  blockchainNetwork: {type: String,enum: ["Alastria"], required: true},
  tokenState: [
    {blockchain: {type: String, required:true}, amount: {type: Number, required:true}}
  ],
  creatorCompany: {type: String, required: true}
});
BondSchema.index({ bondName: 1 }, { unique: true });

// Export the schema as a Mongoose model
export const BondModel = mongoose.model("Bond", BondSchema);

export const getBonds = () => BondModel.find();
export const getBondById = (id: string) => BondModel.findById(id);
export const createBond = (values: Record<string, any>) =>
  new BondModel(values).save();
export const deleteBondById = (id: string) =>
  BondModel.findOneAndDelete({ _id: id });

