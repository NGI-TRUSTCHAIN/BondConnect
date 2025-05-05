import express from "express";
import { saveBond } from "../db/bondDrafts";

export const addBondDraft = async (req: express.Request, res: express.Response) => {
  try {
    const draftData = req.body;

    // Crea el borrador con los datos enviados (pueden estar incompletos)
    const bondDraft = await saveBond(draftData);

    res.status(201).json(bondDraft);
  } catch (error) {
    console.error("Error creating bond draft:", error);
    res.status(500).json({
      error: "Bond draft creation failed",
      message: "An unexpected error occurred while creating the bond draft.",
    });
  }
};