import express from "express";
import { MongoServerError } from "mongodb";
import { createInvestor, getInvestors, getInvestorByEmail, updateInvestorById, deleteInvestorById } from "../db/Investor";
import { useBlockchainService } from '../services/blockchain.service'
import { getIssuerById } from '../db/Issuer';
import { getBonds, getBondById, deleteBondById, createBond, BondModel, getBondsByUserId, updateBondById } from "../db/bonds";
import { createPaymentInvoice, updatePaymentInvoiceById, getPaymentInvoicesByBonoId } from "../db/PaymentInvoice";
import { InvestorBonds } from "../models/Bond";
import { handleTransactionError, handleTransactionSuccess } from "../services/trx.service";
import { CREATE_ACCOUNT_MULTIPLE } from "../utils/Constants";
import { useApiBridge } from "../services/api-bridge.service";
/**
 * Obtener todos los usuarios
 */
export const getAllInvestors = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getInvestors(); // Obtiene todos los usuarios de la base de datos
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
 * Obtener todos los INVERSORES DE UNA COMPANY 
 */
export const getAllInvestorsByIssuer = async (req: express.Request, res: express.Response) => {
  try {
    // sacar todos los bonos q tiene creados en una lista
    // llamar a purchainvoice y sacar todos los usaurio por el id del contrato

    const userId = req.params.userId;
    // Busca los bonos donde el campo creatorCompany coincide con el userId

    const bonds = await getBondsByUserId(userId);
    const users: InvestorBonds[] = [];

    for (const bond of bonds) {
      const invoiceList = await getPaymentInvoicesByBonoId(bond._id.toString());

      for (const invoice of invoiceList) {
        users.push({
          userId: invoice.userId,
          bondName: bond.bondName,
          amount: invoice.amount,
          network: invoice.network,
        });
      }
    }

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
export const registerInvestor = async (req: express.Request, res: express.Response) => {
  let newInvestor = null;
  let foundInvestorId = null;

  try {
    const { createCompany } = useBlockchainService();
    console.log("📩 Recibido en req.body:", req.body);
    const investor = req.body.investor;
    const particular = req.body.particular;

    // Validación de campos requeridos en funcion de la figura del inversor
    if (particular) {
      if (!investor.country || !investor.name || !investor.surname ||
        !investor.idCard || !investor.email || !investor.password) {
        res.status(400).json({
          error: "Missing required fields",
          message: "All required fields must be provided.",
        });
        return;
      }
    } else {
      if (!investor.entityLegalName || !investor.country || !investor.taxIdNumber || !investor.website ||
        !investor.name || !investor.surname || !investor.idCard || !investor.email || !investor.password) {
        res.status(400).json({
          error: "Missing required fields",
          message: "All required fields must be provided.",
        });
        return;
      }
    }

    console.log("✅ Validación de datos correcta");
    // Creación del nuevo usuario
    try {
      newInvestor = await createInvestor(investor);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(400).json({
          error: "Investor already exists",
          message: "Investor already exists.",
        });
        return;
      }
      throw error; // Lanza otros errores para que sean manejados en el catch principal
    }

    if (!newInvestor) return;
    const foundInvestor = await getInvestorByEmail(investor.email);
    const foundInvestorNetwork = foundInvestor.get('blockchainNetwork');
    console.log('InvestorNetwork', foundInvestorNetwork);
    foundInvestorId = foundInvestor.get('_id').toString();
    console.log('InvestorId', foundInvestorId);

    let response = null;
    try {
      response = await createCompany(foundInvestorId);
      for (const account of response.accounts) {
        await handleTransactionSuccess(
          foundInvestorId,
          account.network.toUpperCase(),
          CREATE_ACCOUNT_MULTIPLE,
          account
        );
         // Llamar al faucet para la nueva cuenta
         await useApiBridge.faucet(account.address, 10);
         console.log("Faucet realizado para la cuenta:", account.address);
      }
    } catch (error) {
      for (const account of response.accounts) {
        await handleTransactionError(
          foundInvestorId,
          account.network.toUpperCase(),
          CREATE_ACCOUNT_MULTIPLE,
          error
        );
      }
      console.log('Error BlockchainAcc', error)
      res.status(500).json({ error: "Error al crear cuenta en blockchain", message: error.message });
      await deleteInvestorById(foundInvestorId);
      return
      throw error; // Lanza el error para que sea manejado en el catch principal
    }

    // ¡¡¡ IMPORTANTE !!! Revisar con petre
    const updatedInvestor = await updateInvestorById(foundInvestorId, { walletAddress: response.address, accounts: response.accounts });

    console.log(updatedInvestor);
    res.status(201).json(updatedInvestor);
  } catch (error) {
    console.error(error);
    if (foundInvestorId) {
      await deleteInvestorById(foundInvestorId);
    }
    res.status(500).json({
      error: "Investor creation failed",
      message: "An unexpected error occurred while creating the investor.",
    });
  }
};
