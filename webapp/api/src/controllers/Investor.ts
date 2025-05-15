import express from "express";
import { MongoServerError } from "mongodb";
import { createInvestor, getInvestors, getInvestorByEmail, updateInvestorById } from "../db/Investor";
import { useBlockchainService } from '../services/blockchain.service'
import { update } from "lodash";

/**
 * Obtener todos los usuarios
 */
export const getAllInvestors = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getInvestors(); // Obtiene todos los usuarios de la base de datos
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while retrieving users.",
    });
  }
};

/**
 * Crear un nuevo usuario
 */
export const registerInvestor = async (req: express.Request, res: express.Response) => {
  try {
    const { createCompany } = useBlockchainService();
    console.log("📩 Recibido en req.body:", req.body);
    const investor = req.body.investor;
    const particular = req.body.particular;

    // Validación de campos requeridos en funcion de la figura del inversor
    if (particular) {
      if (!investor.country || !investor.name || !investor.surname ||
        !investor.idCard || !investor.email || !investor.password) {
        res.status(400).json({
          error: "Missing required fields",
          message: "All required fields must be provided.",
        });
        return;
      }
    } else {
      if (!investor.entityLegalName || !investor.country || !investor.taxIdNumber || !investor.website ||
        !investor.name || !investor.surname || !investor.idCard || !investor.email || !investor.password) {
        res.status(400).json({
          error: "Missing required fields",
          message: "All required fields must be provided.",
        });
        return;
      }
    }

    console.log("✅ Validación de datos correcta");
    let newInvestor;
    // Creación del nuevo usuario
    try {
      newInvestor = await createInvestor(investor);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(400).json({
          error: "Investor already exists",
          message: "Investor already exists.",
        });
        return;
      }
      throw error; // Lanza otros errores para que sean manejados en el catch principal
    }

    if (!newInvestor) return;

    const foundInvestor = (await getInvestorByEmail(newInvestor.email))._id.toString();

    const { address, createdAt, accounts} = await createCompany(foundInvestor)
        
    // ¡¡¡ IMPORTANTE !!! Revisar con petre
    await updateInvestorById(foundInvestor, { walletAddress: address, accounts: accounts});


    console.log(newInvestor);
    res.status(201).json(newInvestor);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "User creation failed",
      message: "An unexpected error occurred while creating the user.",
    });
  }
};
