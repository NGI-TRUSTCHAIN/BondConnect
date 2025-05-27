import { getAllTrxSuccessfulls } from "../db/trxSuccessful";
import { getAllTrxErrors } from "../db/trxError";
import express from "express";



export const getAllTrxSuccess = async (req: express.Request, res: express.Response) => {
    try {
    const trxSuccessfulls = await getAllTrxSuccessfulls();
    res.status(200).json(trxSuccessfulls);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
  }
};

export const getAllTrxError = async (req: express.Request, res: express.Response) => {
    try {
    const trxErrors = await getAllTrxErrors();
    res.status(200).json(trxErrors);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
  }
};
