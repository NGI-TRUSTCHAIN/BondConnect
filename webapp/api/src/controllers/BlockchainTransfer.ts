import express from "express";
import { getBondByBondName } from "../db/bonds";
import { createTransferData, getTransferData } from "../db/BlockchainTransfer";
import { getIssuerById } from "../db/Issuer";
import { useApiBridge } from "../services/api-bridge.service";

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

    const bond = await getBondByBondName(transferData.tokenName);
    const issuer = await getIssuerById(bond.creatorCompany);
    const orgContractAddress = bond.tokenState.find((block: any) => 
      block.blockchain === transferData.originBlockchain).contractAddress;
    
    if (transferData.destinationBlockchain === bond.blockchainNetwork) {
      // Si la blockchain de destino es la misma que la del bond
      await useApiBridge.burn(orgContractAddress, transferData.tokenNumber, transferData.destinationBlockchain, 
        issuer.walletAddress, bond.contractAddress);
    } else {
      // Si la blockchain de destino es diferente, ejecutamos el bridge
      await useApiBridge.bridge(bond.contractAddress, issuer.walletAddress, transferData.tokenNumber,
        transferData.tokenName, bond.bondSymbol, Math.floor(bond.price));
    }
    
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
