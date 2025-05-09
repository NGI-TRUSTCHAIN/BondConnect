import express from 'express';
import { createIssuer, getIssuerByEmail, getIssuers, IIssuer, updateIssuerById } from '../db/Issuer'; // Asegúrate de importar el modelo correctamente
import { MongoServerError } from 'mongodb';
import { useBlockchainService } from '../services/blockchain.service'

/**
 * Obtener todos los usuarios
 */
export const getAllIssuers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getIssuers(); // Obtiene todos los usuarios de la base de datos
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
export const registerIssuer = async (req: express.Request, res: express.Response) => {
  try {
    console.log("📩 Recibido en req.body:", req.body);
    const issuer = req.body;
    const { createCompany } = useBlockchainService();

    // Validación de campos requeridos
    if (!issuer.entityLegalName || !issuer.country || !issuer.taxIdNumber || !issuer.name || !issuer.website
      || !issuer.surname || !issuer.idCard || !issuer.email || !issuer.password) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }

    console.log('✅ Validación de datos correcta');

    // Creación del nuevo usuario
    const newIssuer = await createIssuer(issuer).catch((error: MongoServerError) => {
      if (error.code === 11000) {
        res.status(400).json({
          error: "Issuer already exists",
          message: `The value for ${Object.keys(error.keyValue).join(", ")} already exists.`,
        });
        return;
      }
    });

    if (!newIssuer) return;
    // Crear company en blockchain y guardar wallet address
    
    const foundIssuer = (await getIssuerByEmail(newIssuer.email))._id.toString();
    console.log(foundIssuer)
    const { address, createdAt, accounts} = await createCompany(foundIssuer)
    
    await updateIssuerById(foundIssuer, { walleAddress: address, accounts: accounts});

    console.log("nuevo",newIssuer)
    res.status(201).json(newIssuer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "User creation failed",
      message: "An unexpected error occurred while creating the user.",
    });
  }
};
