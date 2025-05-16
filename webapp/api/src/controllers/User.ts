import { MongoServerError } from "mongodb";
import { createUser, getUsers } from "../db/User";
import express from "express";
import { useApiBridge } from "../services/api-bridge.service";
import { getBondByBondName } from "../db/bonds";
import { getIssuerById } from "../db/Issuer";
import { getInvestorByEmail, getInvestorById } from "../db/Investor";
export const getAllUsers = async (req: express.Request,res: express.Response) => {
  try {
    const users = await getUsers();
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
      block.blockchain === purchaseData.destinationBlockchain).contractAddress;
    const issuer = await getIssuerById(bond.creatorCompany);
    const inversor = await getInvestorByEmail(purchaseData.userId);

    await useApiBridge.requestTransfer(inversor.walletAddress,issuer.walletAddress, purchaseData.purchasedTokens,
      purchaseData.destinationBlockchain.toUpperCase(), contractAddress);
    // Validate required fields
    if (!purchaseData.userId || !purchaseData.destinationBlockchain || !purchaseData.investToken || !purchaseData.purchasedTokens) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }  
    console.log('ok - all data');

    const purchase = await createUser(purchaseData)
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