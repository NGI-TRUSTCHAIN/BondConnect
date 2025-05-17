import express from 'express';
import { createIssuer, getIssuerByEmail, getIssuers, IIssuer, updateIssuerById } from '../db/Issuer'; // Asegúrate de importar el modelo correctamente
import { MongoServerError } from 'mongodb';
import { useBlockchainService } from '../services/blockchain.service'
import { UserInfo, UpcomingPayment, PurchaseBond } from "../models/Payment";
import { getBonds, getBondById, deleteBondById, createBond, BondModel, getBondsByUserId, updateBondById } from "../db/bonds";
import { createPaymentInvoice, updatePaymentInvoiceById, getPaymentInvoicesByBonoId } from "../db/PaymentInvoice";
import { InvestorBonds } from "../models/Bond";
import { getIssuerById } from '../db/Issuer';
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
    const { address, createdAt, accounts} = await createCompany(foundIssuer)
    
    await updateIssuerById(foundIssuer, { walletAddress: address, accounts: accounts});

    console.log("nuevo",newIssuer)
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
                });


                const endDate = dayjs(bond.redemptionFinishDate);
                const diffMonths = endDate.month() - today.month();

                if (                   
                    diffMonths === 1 &&
                    endDate.date() === today.date()
                ) {
                   
                    userResponse.upcomingPayment.push({
                        bondName: bond.bondName,
                        paymentDate: bond.redemptionFinishDate.toString(),
                        paymentAmount: (token.amount - Number(balanceResponse.message)) * bond.price, // calcular el precio esta mal asi 
                    });
                }               
            }       
        }      
     
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
        const bonds = await getBondsByUserId(userId);

        const userResponse: UserInfo = { tokenList: [], upcomingPayment: [] };
        const today = dayjs();

        // hay q sacar los bonos hechos -->  y cuando se haya pasado la fecha del mes, como es un pago anual
        // tendremos q sacar los invoice del id del bono y comprobar lo q esta pagado.
        // tendremos q filtar por paid


        for (const bond of bonds) {
            for (const token of bond.tokenState) {
              
            }
        }


        res.status(200).json(userResponse);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los bonos del usuario" });
    }
};
