import express from "express";
import { getBonds, getBondById, deleteBondById, createBond, BondModel, getBondsByUserId } from "../db/bonds";
import { Bond } from "../models/Bond";
import { MongoServerError } from "mongodb";
import { useBlockchainService } from '../services/blockchain.service'
import { useBusinessService } from '../services/business.service'
import { getBscBalance } from '../services/api-business.service'
import { getIssuerById } from '../db/Issuer'; 
// import { authentication, random } from "../helpers";

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

export const getAllBonds = async (req: express.Request, res: express.Response) => {
  try {
    const bonds = await getBonds();
    res.status(200).json(bonds);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
  }
};

export const getBondsByUser = async (req: express.Request, res: express.Response) => {
    const { balance } = useBlockchainService();
    try {
    const userId = req.params.userId;
        // Busca los bonos donde el campo creatorCompany coincide con el userId
    const wallet = (await getIssuerById(userId)).walleAddress;
    const bonds = await getBondsByUserId(userId); 

    bonds as Bond[];

        for (const bond of bonds) {
            for (const token of bond.tokenState) {
                const response = await balance(token.contractAddress, wallet, token.blockchain);
                token.amountAvaliable = Number(response.message);
            }
        }            

    res.status(200).json(bonds);
  } catch (error) {
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

    if (blockchainNetwork === "other" && (!otherBlockchainNetwork || otherBlockchainNetwork.trim() === "")) {
      res.status(400).json({
        error: "Missing blockchain network details",
        message: "If the blockchain network is not in the list, specify an alternative blockchian network.",
      });
      return;
    }
    console.log("ok - all data");

    // Create the bond using the createBond method
    const bond = await createBond(bondData).catch((error: MongoServerError) => {
      if (error.code === 11000) {
        res.status(400).json({
          error: "Duplicate bondName detected",
          message: "Duplicate bondName detected.",
        });
        return;
      }
    });

    if (!bond) return;
  
    const wallet = (await getIssuerById(bond.creatorCompany)).walleAddress;
    const bondPrice = await calculateBondPrice(bond);
    // //¡¡¡¡ PENDIENTE !!!!  Pendiente SYMBOL
    const responseCreateCompanyBond = await createCompanyBond(bond.bondName, "TST", bondPrice, wallet);
    const contractAddress = await getBondNetWorkAccount(responseCreateCompanyBond.accounts, bond.blockchainNetwork.toUpperCase());
    const responseMintBond = await mintBond(contractAddress, wallet, bond.goalAmount);

    //const responseBalance = balance(contractAddress, wallet, networkName);

    // //¡¡¡¡ PENDIENTE !!!!  Contract Address AÑADIR A MONGO  !!!
    // //¡¡¡¡ OPCIONAL !!!!  Añadir trx a una pagina de TRX en mongo  !!!
    res.status(201).json(bond);
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
