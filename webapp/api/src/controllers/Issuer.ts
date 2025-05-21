import express from 'express';
import { createIssuer, getIssuerByEmail, getIssuers, IIssuer, updateIssuerById } from '../db/Issuer'; // Asegúrate de importar el modelo correctamente
import { MongoServerError } from 'mongodb';
import { useBlockchainService } from '../services/blockchain.service'
import { UserInfo, UpcomingPayment, PurchaseBond } from "../models/Payment";
import { getBonds, getBondById, deleteBondById, createBond, BondModel, getBondsByUserId, updateBondById } from "../db/bonds";
import { createPaymentInvoice, updatePaymentInvoiceById, getPaymentInvoicesByBonoId, updatePaymentInvoiceByData } from "../db/PaymentInvoice";
import { InvestorBonds } from "../models/Bond";
import { Payment, Investors} from "../models/Payment";
import { getIssuerById} from '../db/Issuer';
import dayjs from "dayjs";

/**
 * Obtener todos los usuarios
 */
export const getAllIssuers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getIssuers(); // Obtiene todos los usuarios de la base de datos
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while retrieving users.",
    });
  }
};

/**
 * Crear un nuevo usuario
 */
export const registerIssuer = async (req: express.Request, res: express.Response) => {
  try {
    console.log("📩 Recibido en req.body:", req.body);
    const issuer = req.body;
    const { createCompany } = useBlockchainService();

    // Validación de campos requeridos
    if (!issuer.entityLegalName || !issuer.country || !issuer.taxIdNumber || !issuer.name || !issuer.website
      || !issuer.surname || !issuer.idCard || !issuer.email || !issuer.password) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }

    console.log('✅ Validación de datos correcta');

    // Creación del nuevo usuario
    const newIssuer = await createIssuer(issuer).catch((error: MongoServerError) => {
      if (error.code === 11000) {
        res.status(400).json({
          error: "Issuer already exists",
          message: `The value for ${Object.keys(error.keyValue).join(", ")} already exists.`,
        });
        return;
      }
    });

    if (!newIssuer) return;
    // Crear company en blockchain y guardar wallet address

    const foundIssuer = (await getIssuerByEmail(newIssuer.email))._id.toString();
    console.log(foundIssuer)
    const { address, createdAt, accounts } = await createCompany(foundIssuer)

    await updateIssuerById(foundIssuer, { walletAddress: address, accounts: accounts });

    console.log("nuevo", newIssuer)
    res.status(201).json(newIssuer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "User creation failed",
      message: "An unexpected error occurred while creating the user.",
    });
  }
};

/**
 * recuper el token en ciruclacion y los siguientes pagos a hacer  
 */
export const getTokenListAndUpcomingPaymentsByIssuer = async (req: express.Request, res: express.Response) => {
  const { balance } = useBlockchainService();

  try {
    const userId = req.params.userId;
    const wallet = (await getIssuerById(userId)).walletAddress;
    const bonds = await getBondsByUserId(userId);
    const userResponse: UserInfo = { tokenList: [], upcomingPayment: [] };
    const today = dayjs();

    for (const bond of bonds) {
      for (const token of bond.tokenState) {
        const balanceResponse = await balance(token.contractAddress, wallet, token.blockchain);
        userResponse.tokenList.push({
          bondName: bond.bondName,
          network: token.blockchain,
          amountAvaliable: token.amount - Number(balanceResponse.message),
          price: (token.amount - Number(balanceResponse.message)) * bond.price,
        });


        const endDate = dayjs(bond.redemptionFinishDate);
        const diffMonths = endDate.month() - today.month();
        if (
          diffMonths === 1 &&
          endDate.date() === today.date()
        ) {
          let paymentAmount  = bond.price * (bond.interestRate / 100);
          userResponse.upcomingPayment.push({
            bondName: bond.bondName,
            paymentDate: bond.redemptionFinishDate.toString(),
            paymentAmount: (token.amount - Number(balanceResponse.message)) * paymentAmount,
          });

        }
      }
    }
    console.log("userResponse: ", userResponse)
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los bonos del usuario" });
  }
};


/**
 * get Pending Payments. 
 */
export const getPendingPayments = async (req: express.Request, res: express.Response) => {
    const { balance } = useBlockchainService();
    try {
        const userId = req.params.userId;
        const wallet = (await getIssuerById(userId)).walletAddress;
        console.log(wallet);
        const bonds = await getBondsByUserId(userId);
        console.log(bonds);
        const today = dayjs();
 
        let finalResponse : Payment[] = []
        const pastDuePayments: Payment[] = [];
        const upcomingPayments: Payment[] = [];
 
        //pòr cada bonoId hay q buscar en invoice todo y meterlo en una lista de usuario q se guardara en cada bono        
        for (const bond of bonds) {        

 
          const invoices = await getPaymentInvoicesByBonoId(bond.id);
          for (const invoice of invoices) {
 
              // comprobamos si en final response, ya hay un payment con el mismo nombre y mismo network,
              // si existe, crearemos un nuevo registros en el array investors, metiendo su id, q esta en el invoice
              // si no existe , crearemos un nuevo payment rellenandolo y crearemos un nuevo registro enm el array investors.
              const isUnpaid = invoice.paid === false;
              const endDate = dayjs(invoice.endDate);
              const isPastDue = endDate.isBefore(today, "day");
              const isUpcoming = endDate.isBefore(today.add(30, "day")) && endDate.isAfter(today, "day");
 
              if (!isUnpaid) continue;
 
              const investor: Investors = {
                  userId: invoice.userId,
                  numberToken: invoice.amount,
                  amount: invoice.amount * bond.price,
                  paid: invoice.paid
              };
              console.log('investor', investor);
 
              const targetList = isPastDue ? pastDuePayments  : upcomingPayments ;
              console.log('targetList', targetList);
              if (!targetList) continue;
              console.log('targetList', targetList);
 
              let existingPayment = targetList.find(
                  p => p.bondName === bond.bondName && p.network === invoice.network
              );
              console.log('existingPayment', existingPayment);
 
              if (existingPayment) {
                  existingPayment.investors.push(investor);
                  existingPayment.numberToken += invoice.amount;
                  existingPayment.amount += (investor.amount); 
              } else {
                  const newPayment: Payment = {
                      bondName: bond.bondName,
                      bondId: bond._id.toString(),
                      network: invoice.network,
                      numberToken: invoice.amount,
                      amount: investor.amount,
                      paymentDate: invoice.endDate,
                      investors: [investor]
                  };
                  console.log('newPayment', newPayment);
                  targetList.push(newPayment);
              }
          }
        }
 
        console.log('upcomingPayments', upcomingPayments);
        console.log('pastDuePayments', pastDuePayments);
        res.status(200).json({
            upcomingPayments,
            pastDuePayments
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los bonos del usuario" });
    }
};

export const updatePayment = async (req: express.Request, res: express.Response) => {
  const { userId, bondId, network } = req.params;
  const paid  = true;
  const payment = await updatePaymentInvoiceByData(userId, bondId, network, { paid });
  res.status(200).json(payment);
}
