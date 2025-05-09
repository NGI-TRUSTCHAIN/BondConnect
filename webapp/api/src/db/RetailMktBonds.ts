import { Schema, model, Document } from 'mongoose';

// Interfaz del documento
export interface IRetailMktBond extends Document {
  investToken: string; // Stores the id of the token selected
  numTokensOffered: number;
  destinationBlockchain: string;
}

// Esquema Mongoose
const RetailMktBondSchema = new Schema<IRetailMktBond>({
  investToken: { type: String, required: true },
  numTokensOffered: { type: Number, required: true },
  destinationBlockchain: { type: String, required: true },
}, {
  timestamps: true,
});

export const RetailMktBondModel = model<IRetailMktBond>('RetailMktBond', RetailMktBondSchema);

// Funciones CRUD básicas
export const getRetailMktBonds = () => RetailMktBondModel.find();
export const getRetailMktBondById = (id: string) => RetailMktBondModel.findById(id);
export const getRetailMktBondByToken = (investToken: string) => RetailMktBondModel.findOne({ investToken });
export const createRetailMktBond = (values: Record<string, any>): Promise<IRetailMktBond> => new RetailMktBondModel(values).save();
export const deleteRetailMktBondById = (id: string) => RetailMktBondModel.findOneAndDelete({ _id: id });
export const updateRetailMktBondById = (id: string, update: Partial<IRetailMktBond>) => RetailMktBondModel.findByIdAndUpdate(id, update, { new: true });
