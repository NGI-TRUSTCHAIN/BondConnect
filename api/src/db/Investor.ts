import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // Número de rondas de hashing

const InvestorSchema = new mongoose.Schema({
  entityLegalName: { type: String },
  taxIdNumber: { type: String, unique: true },
  website: { type: String },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  country: { type: String, required: true },
  idCard: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });


// Middleware para hashear la contraseña antes de guardar
InvestorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Método para comparar contraseñas
InvestorSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const InvestorModel = mongoose.model("Investor", InvestorSchema);
// 📌 Funciones CRUD básicas
export const getInvestors = () => InvestorModel.find();
export const getInvestorById = (id: string) => InvestorModel.findById(id);
export const getInvestorByEmail = (email: string) => InvestorModel.findOne({email});
export const createInvestor = async (values: Record<string, any>) => await new InvestorModel(values).save();
export const deleteInvestorById = (id: string) => InvestorModel.findOneAndDelete({ _id: id });
