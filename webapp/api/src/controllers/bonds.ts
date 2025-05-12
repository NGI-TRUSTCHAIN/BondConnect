import express from "express";
import { getBonds, getBondById, deleteBondById, createBond, BondModel } from "../db/bonds";
import { MongoServerError } from "mongodb";
import { useBlockchainService } from '../services/blockchain.service'
import { getIssuerById } from '../db/Issuer'; 
import { add } from "lodash";
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

export const addBond = async (req: express.Request, res: express.Response) => {
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

    const { createCompanyBond, mintBond } = useBlockchainService();

    if (!bond) return;
  
    console.log("\nBond: ");
    console.log(bond);

    const foundBond = getBondById(bond._id.toString());
    const wallet = (await getIssuerById(bond.creatorCompany)).walleAddress;

    console.log("\nWallet Address: " + wallet);
    console.log("\nBond name: " + bond.bondName);
   
    // REVISAR bondSymbol y bondPrice
    const bondPrice = bond.goalAmount / bond.numberTokens;
    console.log("\nBond price: " + bondPrice);
    const responsecreateCompanyBond = await createCompanyBond(bond.bondName, "TST", bondPrice, wallet);

    const account = responsecreateCompanyBond.accounts;

    var cuenta = "";
    account.forEach(account => {
      console.log("\nDireccion: "+ account.address);
      cuenta = account.address;
    });
    
    // REVISAR creditAmount 
    const responseMint = await mintBond(cuenta, wallet, bond.goalAmount);
    
    console.log("\nRespuesta createCompanyBond: ");
    console.log(responsecreateCompanyBond);
    console.log("\nRespuesta mintBond: ");
    console.log(responseMint);
    
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
