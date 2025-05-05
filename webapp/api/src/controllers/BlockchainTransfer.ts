import { createTransferData, getTransferData } from "../db/BlockchainTransfer";
import express from "express";

export const getTransferHistory = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const history = await getTransferData();
    res.status(200).json(history);
  } catch (error) {
    console.log(error);
    res.status(500).send({error:"Internal server error", massage:"Internal server error"});
  }
};

export const addTransferTicket = async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.body);
    const transferData = req.body
    

    // Validate required fields
    if (!transferData.tokenName || !transferData.tokenNumber || !transferData.destinationBlockchain || !transferData.originBlockchain) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }  
    console.log('ok - all data');

    // Create the bond using the createBond method
    const transferTicket = await createTransferData(transferData);

    res.status(201).json(transferTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Bond creation failed",
      message: "An unexpected error occurred while creating the bond.",
    });
  }
};
