import { createSaleReceipt } from "../db/SaleReceipt";
import express from "express";

export const addSaleReceipt = async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.body);
    const saleReceipt = req.body
    

    // Validate required fields
    if (!saleReceipt.selledToken || !saleReceipt.selledAmount || !saleReceipt.pricePerToken || !saleReceipt.saleType) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }  
    console.log('ok - all data');

    // Create the bond using the createBond method
    const receipt = await createSaleReceipt(saleReceipt);

    res.status(201).json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Bond creation failed",
      message: "An unexpected error occurred while creating the bond.",
    });
  }
};
