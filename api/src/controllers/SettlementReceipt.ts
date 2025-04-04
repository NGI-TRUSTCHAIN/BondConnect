import { createSettlementReceipt } from "../db/SettlementReceipt";
import express from "express";

export const addSettlementReceipt = async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.body);
    const settlementReceipt = req.body
    

    // Validate required fields
    if (!settlementReceipt.settleToken || !settlementReceipt.settlementType) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }  
    console.log('ok -  data');

    if (settlementReceipt.settlementType === 'Partial redemption') {
      if (!settlementReceipt.amountOf || !settlementReceipt.distributionCriteria){
        res.status(400).json({
          error: "Missing required fields if settlement is partial",
          message: "All fields are required if it is partial redemption.",
        });
        return;
      }
    }

    console.log('ok - all data');

    // Create the bond using the createBond method
    const receipt = await createSettlementReceipt(settlementReceipt);

    res.status(201).json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Bond creation failed",
      message: "An unexpected error occurred while creating the bond.",
    });
  }
};
