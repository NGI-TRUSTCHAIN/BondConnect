import { MongoServerError } from "mongodb";
import { createPurchaseUser, getPurchaseUsers, getRetailPurchasedByUserId } from "../db/PurchaseUser";
import { createPaymentInvoice, updatePaymentInvoiceById, getPaymentInvoicesByUserId } from "../db/PaymentInvoice";
import express from "express";
import { useApiBridge } from "../services/api-bridge.service";
import { getBondByBondName, getBondById } from "../db/bonds";
import { getIssuerById } from "../db/Issuer";
import { getInvestorByEmail, getInvestorById } from "../db/Investor";
import { UserInfo, UpcomingPayment, PurchaseBond } from "../models/Payment";
import dayjs from "dayjs";
import { useBlockchainService } from '../services/blockchain.service'
import { VoidSigner } from "ethers";
import { getRetailMktBonds, updateRetailMktBondById } from "../db/RetailMktBonds";
import { handleTransactionError, handleTransactionSuccess } from "../services/trx.service";
import { REQUEST_TRANSFER, REQUEST_STABLE } from "../utils/Constants";


export const getAllPurchaseUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getPurchaseUsers();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
  }
};

export const purchase = async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.body);
    const purchaseData = req.body

    // Validate required fields
    if (!purchaseData.userId || !purchaseData.destinationBlockchain || !purchaseData.investToken || !purchaseData.purchasedTokens) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }

    const bond = await getBondByBondName(purchaseData.investToken);
    if (!bond) {
      res.status(404).json({
        error: "Bond not found",
        message: "The specified bond does not exist.",
      });
      return;
    }

    const contractAddress = bond.tokenState.find((block: any) =>
      block.blockchain.toUpperCase() === purchaseData.destinationBlockchain.toUpperCase())?.contractAddress;

    if (!contractAddress) {
      res.status(400).json({
        error: "Invalid blockchain",
        message: "The specified blockchain is not supported for this bond.",
      });
      return;
    }

    const issuer = await getIssuerById(bond.creatorCompany);
    if (!issuer) {
      res.status(404).json({
        error: "Issuer not found",
        message: "The bond issuer does not exist.",
      });
      return;
    }

    const inversor = await getInvestorById(purchaseData.userId);
    if (!inversor) {
      res.status(404).json({
        error: "Investor not found",
        message: "The specified investor does not exist.",
      });
      return;
    }

    let trxStable;
    let trxTransfer;

    try {
      trxStable = await useApiBridge.requestStable(issuer.walletAddress, inversor.walletAddress, purchaseData.purchasedTokens);
      if (trxStable) {
        await handleTransactionSuccess(
          purchaseData.userId,
          purchaseData.destinationBlockchain.toUpperCase(),
          REQUEST_STABLE,
          trxStable
        );
      }
    } catch (error) {
      await handleTransactionError(
        purchaseData.userId,
        purchaseData.destinationBlockchain.toUpperCase(),
        REQUEST_STABLE,
        error
      );
      res.status(400).json({
        error: "Error in requestStable",
        message: error instanceof Error ? error.message : "Unknow error in requestStable",
        details: error
      });
      return;
    }

    try {
      trxTransfer = await useApiBridge.requestTransfer(inversor.walletAddress, issuer.walletAddress, purchaseData.purchasedTokens,
        purchaseData.destinationBlockchain.toUpperCase(), contractAddress);
        if(trxTransfer){
          await handleTransactionSuccess(
            purchaseData.userId,
            purchaseData.destinationBlockchain.toUpperCase(),
            REQUEST_TRANSFER,
            trxTransfer
        );
      }
    } catch (error) {
      await handleTransactionError(
        purchaseData.userId,
        purchaseData.destinationBlockchain.toUpperCase(),
        REQUEST_TRANSFER,
        error
      );
      res.status(400).json({
        error: "Error in requestTransfer",
        message: error instanceof Error ? error.message : "Unknow error in requestTransfer",
        details: error
      });
      return;
    }

    try {
      // UPDATE CREATE INVOICE PAYMENT
      // Recuperar la lista de paymenteInvoice
      const invoiceList = await getPaymentInvoicesByUserId(purchaseData.userId);

      const existingInvoice = invoiceList.find(
        invoice =>
          invoice.bonoId === bond.id &&
          invoice.network === purchaseData.destinationBlockchain.toUpperCase()
      );

      if (existingInvoice) {
        // Actualizar amount
        await updatePaymentInvoiceById(existingInvoice.id, {
          amount: existingInvoice.amount + purchaseData.purchasedTokens,
        });
      } else {
        // Crear nuevo registro
        await createPaymentInvoice({
          userId: purchaseData.userId,
          bonoId: bond.id,
          endDate: bond.bondMaturityDate,
          network: purchaseData.destinationBlockchain.toUpperCase(),
          trxStable: trxStable.message,
          trxTransfer: trxTransfer.message,
          amount: purchaseData.purchasedTokens,
          paid: false
        });
      }

      // Update RetailMktBond token amount
      const retailBonds = await getRetailMktBonds();
      const matchingRetailBond = retailBonds.find(rtlBond =>
        rtlBond.investToken === bond._id.toString() &&
        rtlBond.destinationBlockchain.toUpperCase() === purchaseData.destinationBlockchain.toUpperCase()
      );

      if (matchingRetailBond) {
        await updateRetailMktBondById(matchingRetailBond._id.toString(), {
          numTokensOffered: Number(matchingRetailBond.numTokensOffered) - Number(purchaseData.purchasedTokens)
        });
      }

      const purchase = await createPurchaseUser(purchaseData);
      res.status(201).json({
        purchase,
        transactions: {
          stable: trxStable.message,
          transfer: trxTransfer.message
        }
      });
      console.log("purchase", purchase);
      console.log("trxStable", trxStable);
      console.log("trxTransfer", trxTransfer);
      return;

    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "User creation failed",
        message: "An unexpected error occurred while creating the bond.",
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "User creation failed",
      message: "An unexpected error occurred while creating the bond.",
    });
    return;
  }
};

export const getTokenListAndUpcomingPaymentsByInvestor = async (req: express.Request, res: express.Response) => {
  try {
    const { balance } = useBlockchainService();
    const userId = req.params.userId;
    const wallet = (await getInvestorById(userId)).walletAddress;
    const paymentInvoices = await getPaymentInvoicesByUserId(userId);
    const userResponse: UserInfo = { tokenList: [], upcomingPayment: [] };

    const today = dayjs();

    for (const invoice of paymentInvoices) {
      const bond = await getBondById(invoice.bonoId);
      const balanceResponse = await balance(bond.tokenState[0].contractAddress, wallet, bond.tokenState[0].blockchain);
      // REVISAR LOGICA CALCULO PRICE
      // tokenList: todos los registros sin importar 'paid'
      userResponse.tokenList.push({
        bondName: bond.bondName,
        network: invoice.network,
        amountAvaliable: invoice.amount,
        price: (invoice.amount * Number(balanceResponse.message)) * bond.price,
      });

      // upcomingPayment: solo si falta un mes exacto y no está pagado
      const endDate = dayjs(invoice.endDate);
      const diffMonths = endDate.month() - today.month();

      if (
        !invoice.paid
        // &&
        // diffMonths === 1 &&
        // endDate.date() === today.date()
      ) {
        let paymentAmount = invoice.amount * bond.price * (bond.interestRate / 100);
        userResponse.upcomingPayment.push({
          bondName: bond.bondName,
          paymentDate: dayjs(invoice.endDate).format('D/MM/YYYY'),
          paymentAmount: paymentAmount,
        });
      }
    }
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los bonos del usuario" });
  }
};

export const balanceFaucet = async (req: express.Request, res: express.Response) => {
  try {
    const data = req.body;

    const balance = await useApiBridge.faucetBalance(data.address);

    let big = BigInt(balance.message);

    let amountFinal: number = Number(big);

    console.log(amountFinal);

    res.status(200).json(amountFinal / 1000000);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los bonos del usuario" });
  }
};