import express, { response } from "express";
import { getBondByBondName, getBondById, updateBondById } from "../db/bonds";
import { createTransferData, getTransferData } from "../db/BlockchainTransfer";
import { getIssuerById } from "../db/Issuer";
import { useApiBridge } from "../services/api-bridge.service";
import { handleTransactionError, handleTransactionSuccess } from "../services/trx.service";
import { BRIDGE, BURN } from "../utils/Constants";

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
    console.log('tranferdata ' ,transferData);
    const bond = await getBondById(transferData.tokenName);
    console.log(bond);
    
    const issuer = await getIssuerById(bond.creatorCompany);
    const orgContractAddress = bond.tokenState.find((block: any) => 
      block.blockchain === transferData.originBlockchain).contractAddress;
    
    let response;
    if (transferData.destinationBlockchain === bond.blockchainNetwork) {
      // Si la blockchain de destino es la misma que la del bond
      console.log('contrato AMOy', orgContractAddress);
      console.log('issuer: ', issuer.walletAddress);
      console.log('blockchain de origen', transferData.originBlockchain);
      console.log('tokenNumber', transferData.tokenNumber);
      console.log('bond: ', bond.tokenState.find((token: any) => (token.blockchain === 'ALASTRIA')).contractAddress);
      
      try {
        response = await useApiBridge.burn(orgContractAddress, transferData.tokenNumber, transferData.originBlockchain, 
          issuer.walletAddress, bond.tokenState.find((token: any) => (token.blockchain === 'ALASTRIA')).contractAddress);
          console.log("response BURN", response);
        await handleTransactionSuccess(
          issuer.id,
          transferData.originBlockchain.toUpperCase(),
          BURN,
          response
        );
      } catch (error) {
        await handleTransactionError(
          issuer.id,
          transferData.originBlockchain.toUpperCase(),
          BURN,
          error
        );  
      }
      bond.tokenState.find((token: any) => (token.blockchain === 'ALASTRIA')).amount += Number(transferData.tokenNumber)
      bond.tokenState.find((token: any) => (token.blockchain === 'AMOY')).amount -= Number(transferData.tokenNumber)
    } else {
      // Si la blockchain de destino es diferente, ejecutamos el bridge
      console.log('bond.contractAddress', bond.contractAddress);
      console.log('issuer: ', issuer.walletAddress);
      
      try {
        response = await useApiBridge.bridge(bond.tokenState.find((token: any) => (token.blockchain === 'ALASTRIA')).contractAddress, issuer.walletAddress,transferData.tokenNumber,
          bond.bondName, bond.bondSymbol, Math.floor(bond.price));
          await handleTransactionSuccess(
            issuer.id,
            transferData.destinationBlockchain.toUpperCase(),
            BRIDGE,
            response
          );
      } catch (error) {
        await handleTransactionError(
          issuer.id,
          transferData.destinationBlockchain.toUpperCase(),
          BRIDGE,
          error
        );
      }
      bond.tokenState.push({blockchain: transferData.destinationBlockchain,
        amount: Number(transferData.tokenNumber), contractAddress: response.contract});
      bond.tokenState.find((token: any) => (token.blockchain === 'ALASTRIA')).amount -= Number(transferData.tokenNumber)
    }
    // Create the bond using the createBond method
    /// IMPORTANTE Actualizar BOnd
    await updateBondById(bond._id.toString(), bond);
    const transferTicket = await createTransferData(transferData);

    res.status(201).json({transferTicket, trx: response.message});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Bond creation failed",
      message: "An unexpected error occurred while creating the bond.",
    });
  }
};
