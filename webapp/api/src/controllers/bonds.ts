import express from "express";
import { getBonds, getBondById, deleteBondById, createBond, BondModel, getBondsByUserId, updateBondById, IBond } from "../db/bonds";
import { Bond } from "../models/Bond";
import { MongoServerError } from "mongodb";
import { useBlockchainService } from '../services/blockchain.service'
import { useBusinessService } from '../services/business.service'
import { getBscBalance } from '../services/api-business.service'
import { getIssuerById } from '../db/Issuer'; 
// import { authentication, random } from "../helpers";
import { CREATE_BOND, MINT_BOND } from "../utils/Constants";
import { handleTransactionSuccess, handleTransactionError } from "../services/trx.service";


// export const getBond = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const email = req.params.email
//     const users = await getUserByEmail(email);

//     res.status(200).json(users);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({error:"Internal server error", massage:"Internal server error"});
//   }
// };

// AÑADIR EN EL FRONT Q SE LA PASE EL ID DEL USUARIO
export const getAllBonds = async (req: express.Request, res: express.Response) => {
    try {
    const userId = req.params.userId;
    const bonds = await getBondsByUserId(userId);
    res.status(200).json(bonds);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
  }
};

export const getBondsByUser = async (req: express.Request, res: express.Response) => {
    const { balance } = useBlockchainService();
    try {
    const { userId, walletAddress} = req.body;
        // Busca los bonos donde el campo creatorCompany coincide con el userId
    const issuer = (await getIssuerById(userId));
    if (!issuer) {
      res.status(404).json({ error: "Issuer not found" });
      return; 
  }
    const bonds = await getBondsByUserId(userId).lean(); 

    const finalResponse = [];
  console.log('BOND', bonds);
  
     for (const bond of bonds) {
         for (const token of bond.tokenState) {
          // console.log(' token '+ token.contractAddress + " Wallet " + issuer.walletAddress + " Blockchain " + token.blockchain);
          const newBond = {
            ...bond,
            blockchainNetwork: token.blockchain as "ALASTRIA" | "AMOY", // sobreescribimos con el valor deseado
            numberTokens: (await balance(token.contractAddress, issuer.walletAddress, token.blockchain)).message,
      };
      finalResponse.push(newBond);
         }
     }        

    console.log('FINAL RESPONSE', finalResponse);
    res.status(200).json(finalResponse);
  } catch (error) {
    console.log('ERROR', error);
    res.status(500).json({ error: "Error al obtener los bonos del usuario" });
  }
};

export const addBond = async (req: express.Request, res: express.Response) => {

  const { createCompanyBond, mintBond, balance } = useBlockchainService();
  const { calculateBondPrice, getBondNetWorkAccount } = useBusinessService();

  try {
    console.log(req.body);
    const bondData = req.body;

    const {
      bondName,
      bondStartDate,
      bondMaturityDate,
      bondPurpose,
      interestRate,
      paymentFreq,
      goalAmount,
      numberTokens,
      earlyRedemptionClauses,
      penalty,
      redemptionStartDate,
      redemptionFinishDate,
      blockchainNetwork,
      otherBlockchainNetwork,
    } = req.body;

    // Validate required fields
    if (
      !bondName ||
      !bondStartDate ||
      !bondMaturityDate ||
      !bondPurpose ||
      !interestRate ||
      !paymentFreq ||
      !goalAmount ||
      !numberTokens ||
      !earlyRedemptionClauses ||
      !blockchainNetwork
    ) {
      res.status(400).json({
        error: "Missing fields",
        message: "All available fields must be provided.",
      });
      return;
    }
    console.log("ok - data");

    // Validate conditional fields
    if (earlyRedemptionClauses === "yes" && (!penalty || !redemptionStartDate || !redemptionFinishDate)) {
      res.status(400).json({
        error: "Missing early redemption fields",
        message: "If there is early redemption clauses,the penalty and redemptionPeriods fields are required.",
      });
      return;
    }

    console.log("ok - all data");

    let createdBond;

    // Create the bond using the createBond method
    createdBond = await createBond(bondData).catch((error: MongoServerError) => {
      if (error.code === 11000) {
        res.status(400).json({
          error: "Duplicate bondName detected",
          message: "Duplicate bondName detected.",
        });
        return;
      }
    });

    if (!createdBond) return;
  
    try {
      const issuer = (await getIssuerById(createdBond.creatorCompany));
      if (!issuer) {
        res.status(404).json({ error: "Issuer not found" });
        return; 
      }

      const wallet = issuer.walletAddress;
      
      const bondPrice = await calculateBondPrice(createdBond);
      console.log(bondPrice);
      
      let responseCreateCompanyBond;

      try {
        responseCreateCompanyBond = await createCompanyBond(createdBond.bondName, createdBond.bondSymbol,
          bondPrice, wallet);
        await handleTransactionSuccess(
          issuer.id,
          createdBond.blockchainNetwork.toUpperCase(),
          CREATE_BOND,
          responseCreateCompanyBond.accounts[0]
        );
      } catch (error) {
        await handleTransactionError(
          issuer.id,
          createdBond.blockchainNetwork.toUpperCase(),
          CREATE_BOND,
          error
        );
      }   
      
      const contractAddress = await getBondNetWorkAccount(responseCreateCompanyBond.accounts, createdBond.blockchainNetwork.toUpperCase());
      
      let responseMintBond;
      try {
        responseMintBond = await mintBond(contractAddress, wallet, createdBond.numberTokens);
      await handleTransactionSuccess(
        createdBond.creatorCompany,
        createdBond.blockchainNetwork.toUpperCase(),
        MINT_BOND,
        responseMintBond 
      );
      } catch (error) {
        await handleTransactionError(
          issuer.id,
          createdBond.blockchainNetwork.toUpperCase(),
          MINT_BOND,
          error
        );
      }


      // Update the bond with the contract address in tokenState
      await updateBondById(createdBond._id.toString(), { 
        tokenState: [{
          blockchain: createdBond.blockchainNetwork,
          amount: createdBond.numberTokens,
          contractAddress: contractAddress
        }]
      });
      // //¡¡¡¡ OPCIONAL !!!!  Añadir trx a una pagina de TRX en mongo  !!!
      res.status(201).json({
        createdBond, 
        trx: {
          createCompanyBond: responseCreateCompanyBond.message,
          mintBond: responseMintBond.message
        }
      });
    } catch (error) {
      // Si algo falla en las operaciones de blockchain, eliminamos el documento creado
      await deleteBondById(createdBond._id.toString());
      throw error; // Re-lanzamos el error para que sea capturado por el catch exterior
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Bond creation failed",
      message: "An unexpected error occurred while creating the bond.",
    });
  }
};

export const updateBond = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    // Busca y actualiza el bono, devolviendo el documento actualizado
    const updatedBond = await BondModel.findByIdAndUpdate(
      id, // ID del bono a actualizar
      req.body, // Datos de actualización
      { new: true, runValidators: true } // Opciones: `new` devuelve el documento actualizado; `runValidators` valida según el esquema
    );

    if (!updatedBond) {
      res.status(404).json({ message: "Bond not found." });
      return;
    }

    res.status(200).json({ updatedBond });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      error: error.message,
    });
  }
};
