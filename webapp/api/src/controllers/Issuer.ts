import express from 'express';
import { createIssuer, getIssuerByEmail, getIssuers, updateIssuerById } from '../db/Issuer'; // Asegúrate de importar el modelo correctamente
import { MongoServerError } from 'mongodb';
import { useBlockchainService } from '../services/blockchain.service'
import { UserInfo } from "../models/Payment";
import { getBondById, getBondsByUserId } from "../db/bonds";
import { getPaymentInvoicesByBonoId, updatePaymentInvoiceByData, getPaymentInvoiceByData, getPaymentInvoicesByUserId } from "../db/PaymentInvoice";
import { Payment, Investors } from "../models/Payment";
import { getIssuerById } from '../db/Issuer';
import dayjs from "dayjs";
import { getInvestorById } from '../db/Investor';
import { useApiBridge } from '../services/api-bridge.service';
import { REQUEST_TRANSFER } from '../utils/Constants';
import { handleTransactionSuccess, handleTransactionError } from '../services/trx.service';
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

export const getOneIssuer = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getIssuerById(req.params.id); // Obtiene todos los usuarios de la base de datos
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

    const updatedIssuer = await updateIssuerById(foundIssuer, { walletAddress: address, accounts: accounts });

    console.log("nuevo", updatedIssuer)
    res.status(201).json(updatedIssuer);
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
    const invoices = await getPaymentInvoicesByUserId(userId);
    const userResponse: UserInfo = { tokenList: [], upcomingPayment: [] };
    const today = dayjs();

    for (const bond of bonds) {
      for (const token of bond.tokenState) {
        const balanceResponse = await balance(token.contractAddress, wallet, token.blockchain);
        const amountAvailable = token.amount - Number(balanceResponse.message);

        userResponse.tokenList.push({
          bondName: bond.bondName,
          network: token.blockchain,
          amountAvaliable: token.amount - Number(balanceResponse.message),
          price: amountAvailable * bond.price,
        });


        const relatedInvoice = invoices.find(inv =>
          inv.bonoId === bond.id &&
          inv.network === token.blockchain.toUpperCase()
        );

        if (relatedInvoice) {
          for (const payment of relatedInvoice.payments) {
            const paymentDate = dayjs(payment.timeStamp);

            if (!payment.paid && paymentDate.year() === today.year()) {
              const paymentAmount = bond.price * (bond.interestRate / 100);
              userResponse.upcomingPayment.push({
                bondName: bond.bondName,
                paymentDate: paymentDate.format("D/MM/YYYY"),
                paymentAmount: amountAvailable * paymentAmount,
              });
            }
          }
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

    let finalResponse: Payment[] = []
    const pastDuePayments: Payment[] = [];
    const upcomingPayments: Payment[] = [];

    //pòr cada bonoId hay q buscar en invoice todo y meterlo en una lista de usuario q se guardara en cada bono        
    for (const bond of bonds) {

      const invoices = await getPaymentInvoicesByBonoId(bond.id);

      for (const invoice of invoices) {

        for (const payment of invoice.payments) {

          if (payment.paid) continue;
          const paymentDate = dayjs(payment.timeStamp);
          const isPastDue = paymentDate.isBefore(today, "day");
          const isUpcoming = paymentDate.isBefore(today.add(30, "day")) && paymentDate.isAfter(today, "day");

          const investor: Investors = {
            userId: invoice.userId,
            numberToken: invoice.amount,
            amount: invoice.amount * bond.price,
            paid: false,
          };

          const targetList = isPastDue ? pastDuePayments : isUpcoming ? upcomingPayments : null;
          if (!targetList) continue;
          let existingPayment = targetList.find(
            p => p.bondName === bond.bondName && p.network === invoice.network
          );

          if (existingPayment) {
            existingPayment.investors.push(investor);
            existingPayment.numberToken += invoice.amount;
            existingPayment.amount += investor.amount;
          } else {
            const newPayment: Payment = {
              bondName: bond.bondName,
              bondId: bond._id.toString(),
              network: invoice.network,
              numberToken: invoice.amount,
              amount: investor.amount,
              paymentDate: payment.timeStamp.toISOString(),
              investors: [investor],
            };
            targetList.push(newPayment);
          }
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
  const paid = true;

  const invoice = await getPaymentInvoiceByData(userId, bondId, network);
  const bond = await getBondById(bondId);

  const contractAddress = bond.tokenState.find((block: any) =>
    block.blockchain.toUpperCase() === network.toUpperCase()).contractAddress;
  const issuer = await getIssuerById(bond.creatorCompany);
  const inversor = await getInvestorById(userId);
  const amount = invoice.amount * (bond.price * (bond.interestRate / 100)); // dinero que transferir entre cuentas
  console.log('amount', amount);

  try {
    // Pagar al inversor por el bono. REVISAR: solo he inertido las wallet
    let responseTransfer;
    responseTransfer = await useApiBridge.requestTransfer(issuer.walletAddress, inversor.walletAddress, Math.floor(amount),
      network.toUpperCase(), contractAddress);
      if(responseTransfer){
        await handleTransactionSuccess(
          userId,
          network.toUpperCase(),
          REQUEST_TRANSFER,
          responseTransfer
      );
    }
    console.log("Response Transfer:", responseTransfer);
  } catch (error) {
    await handleTransactionError(
      userId,
      network.toUpperCase(),
      REQUEST_TRANSFER,
      error
    );
    console.log("Error al transferir el dinero:", error);
    res.status(500).json({ error: "Error al transferir el dinero" });
    return;
  }
  // if (responseTransfer.status === 200) {
  //   const payment = await updatePaymentInvoiceByData(userId, bondId, network, { paid });
  //   res.status(200).json(payment);
  // } else {
  //   res.status(500).json({ error: "Error al transferir el dinero" });
  // }

  const payment = await updatePaymentInvoiceByData(userId, bondId, network, { paid });

  res.status(200).json(payment);
}
