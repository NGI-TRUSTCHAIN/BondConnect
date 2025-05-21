import express from 'express';
import { getRetailMktBonds, getRetailMktBondById, createRetailMktBond, updateRetailMktBondById, deleteRetailMktBondById } from '../db/RetailMktBonds';
import { MongoServerError } from 'mongodb';
import { getBonds } from '../db/bonds';

// Obtener todos los bonds
export const getAllRetailMktBonds = async (req: express.Request, res: express.Response) => {
  try {
    const retailBonds = await getRetailMktBonds().lean();
    const bonds = await getBonds().lean();

    const finalResponse = []; 
    // Filtrar los bonds que tengan el mismo investToken que el retailBond
    for (const retailBond of retailBonds) {
      const fltBond = bonds.find(bond => bond._id.toString() === retailBond.investToken);
      // REVISAR para añadir de alguna forma el valor de tokens añadidos al retail de retailBond
      // para mostralo y poder comprear en  el front Oportunities
      finalResponse.push({ ...fltBond}); // Agregar el bond filtrado al finalResponse
    }
    res.status(200).json(finalResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error', message: 'Internal server error' });
  }
};

// Obtener bond por ID
export const getRetailMktBond = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const bond = await getRetailMktBondById(id);
    if (!bond) {
      res.status(404).json({ error: 'Not found', message: 'Bond not found' });
      return;
    }
    res.status(200).json(bond);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error', message: 'Internal server error' });
  }
};

// Crear un nuevo bond
export const addRetailMktBond = async (req: express.Request, res: express.Response) => {
  try {
    const { investToken, numTokensOffered, destinationBlockchain } = req.body;

    if (!investToken || !numTokensOffered || !destinationBlockchain) {
      res.status(400).json({
        error: 'Missing fields',
        message: 'investToken, numTokensOffered and destinationBlockchain are required.',
      });
      return;
    }

    const bond = await createRetailMktBond(req.body).catch((error: MongoServerError) => {
      if (error.code === 11000) {
        res.status(400).json({
          error: 'Duplicate investToken detected',
          message: 'Duplicate investToken detected.',
        });
        return;
      }
    });

    res.status(201).json(bond);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Bond creation failed',
      message: 'An unexpected error occurred while creating the bond.',
    });
  }
};

// Actualizar un bond
export const updateRetailMktBond = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const updatedBond = await updateRetailMktBondById(id, req.body);
    if (!updatedBond) {
      res.status(404).json({ message: 'Bond not found.' });
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

// Eliminar un bond
export const deleteRetailMktBond = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const deleted = await deleteRetailMktBondById(id);
    if (!deleted) {
      res.status(404).json({ message: 'Bond not found.' });
      return;
    }
    res.status(200).json({ message: 'Bond deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Deletion failed',
      message: 'An unexpected error occurred while deleting the bond.',
    });
  }
};
