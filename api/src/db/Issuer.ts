import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // Número de rondas de hashing

const IssuerSchema = new mongoose.Schema({
  entityLegalName: { type: String, required: true },
  taxIdNumber: { type: String, required: true, unique: true },
  website: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  country: { type: String, required: true },
  idCard: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });


// Middleware para hashear la contraseña antes de guardar
IssuerSchema.pre('save', async function (next) {
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
IssuerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const IssuerModel = mongoose.model("Issuer", IssuerSchema);
// 📌 Funciones CRUD básicas
export const getIssuers = () => IssuerModel.find();
export const getIssuerById = (id: string) => IssuerModel.findById(id);
export const getIssuerByEmail = (email: string) => IssuerModel.findOne({email});
export const createIssuer = (values: Record<string, any>) => new IssuerModel(values).save();
export const deleteIssuerById = (id: string) => IssuerModel.findOneAndDelete({ _id: id });
