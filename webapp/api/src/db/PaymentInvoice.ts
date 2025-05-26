import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bonoId: { type: String, required: true },
  endDate: { type: String, required: true },
  network: { type: String, required: true },
  trxStable: { type: String, required: true },
  trxTransfer: { type: String, required: true },
  amount: { type: Number, required: true },
  paid: { type: Boolean, required: true },
});

export const PaymentInvoice = mongoose.model("PaymentInvoice", InvoiceSchema);

// Crear una factura de pago
export const createPaymentInvoice = (values: Record<string, any>) =>
    new PaymentInvoice(values).save();

// Obtener todas las facturas de pago
export const getAllPaymentInvoices = () => PaymentInvoice.find();

// Buscar facturas por userId
export const getPaymentInvoicesByUserId = (userId: string) =>
    PaymentInvoice.find({ userId });

// Buscar facturas por bonoId
export const getPaymentInvoicesByBonoId = (bonoId: string) =>
    PaymentInvoice.find({ bonoId });

// Buscar una factura espec�fica por _id
export const getPaymentInvoiceById = (id: string) =>
    PaymentInvoice.findById(id);

// Eliminar una factura por _id
export const deletePaymentInvoiceById = (id: string) =>
    PaymentInvoice.findByIdAndDelete(id);

// Eliminar todas las facturas por userId
export const deletePaymentInvoicesByUserId = (userId: string) =>
    PaymentInvoice.deleteMany({ userId });

// Eliminar todas las facturas por bonoId
export const deletePaymentInvoicesByBonoId = (bonoId: string) =>
    PaymentInvoice.deleteMany({ bonoId });

// Actualizar una factura por _id
export const updatePaymentInvoiceById = (
    id: string,
    update: Partial<Record<string, any>>
) => PaymentInvoice.findByIdAndUpdate(id, update, { new: true })

export const updatePaymentInvoiceByData = (
    userId: string, 
    bondId: string,
    network: string,
    update: Partial<Record<string, any>>
) => PaymentInvoice.findOneAndUpdate(
    { userId: userId, bonoId: bondId, network: network },
    update,
    { new: true }
);

export const getPaymentInvoiceByData = (
    userId: string,
    bondId: string, 
    network: string
) => PaymentInvoice.findOne(
    { userId: userId, bonoId: bondId, network: network }
);