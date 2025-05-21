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

export const getAllPurchaseUsers = async (req: express.Request,res: express.Response) => {
  try {
    const users = await getPurchaseUsers();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({error:"Internal server error", massage:"Internal server error"});
  }
};

export const purchase = async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.body);
    const purchaseData = req.body
    
    // Validate required fields
    // IMPORTANTE LLAMAR a requestTransfer
    const bond = await getBondByBondName(purchaseData.investToken);

    const contractAddress = bond.tokenState.find((block: any) => 
      block.blockchain.toUpperCase() === purchaseData.destinationBlockchain.toUpperCase()).contractAddress;
    const issuer = await getIssuerById(bond.creatorCompany);
    const inversor = await getInvestorById(purchaseData.userId);

    await useApiBridge.requestStable(issuer.walletAddress, inversor.walletAddress, purchaseData.purchasedTokens);

    await useApiBridge.requestTransfer(inversor.walletAddress, issuer.walletAddress, purchaseData.purchasedTokens,
      purchaseData.destinationBlockchain.toUpperCase(), contractAddress);

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
              endDate: bond.bondMaturityDate, // asegúrate de tener esta propiedad
              network: purchaseData.destinationBlockchain.toUpperCase(),
              amount: purchaseData.purchasedTokens,
              paid: false
          });
      }

      // Validate required fields
    if (!purchaseData.userId || !purchaseData.destinationBlockchain || !purchaseData.investToken || !purchaseData.purchasedTokens) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }  
    console.log('ok - all data');

    const purchase = await createPurchaseUser(purchaseData)
    // .catch((error: MongoServerError) => {
    //   if (error.code === 11000) {
    //     res.status(400).json({
    //       error: "User already exists",
    //       message: "User already exists.",
    //     });
    //     return;
    //   }
    // });

    res.status(201).json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "User creation failed",
      message: "An unexpected error occurred while creating the bond.",
    });
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
              !invoice.paid &&
              diffMonths === 1 &&
              endDate.date() === today.date()
          ) {
              let paymentAmount  = invoice.amount * bond.price * (bond.interestRate / 100);
              userResponse.upcomingPayment.push({
                  bondName: invoice.bonoId,
                  paymentDate: invoice.endDate,
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