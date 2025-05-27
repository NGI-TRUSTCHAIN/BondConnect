import { getAllTrxSuccessfulls } from "../db/trxSuccessful";
import { getAllTrxErrors } from "../db/trxError";
import express from "express";
import { getInvestors } from "../db/Investor";



export const getAllTrxSuccess = async (req: express.Request, res: express.Response) => {
    try {
    const trxSuccessfulls = await getAllTrxSuccessfulls();
    console.log(trxSuccessfulls);
    const investors = await getInvestors();
    console.log('investors', investors);
    const trxSuccessfullsWithInvestor = trxSuccessfulls.map(trxs => {
        const investor = investors.find((investor: any) => investor._id.toString() === trxs.userId);
        const { userId, timestamp, network, trx_type, trx } = trxs;
        console.log('investor', investor);
        if (investor) {
            return { 
                timestamp,
                network,
                trx_type,
                trx,
                userId: investor.walletAddress
            };
        }
        return { 
            timestamp,
            network,
            trx_type,
            trx,
            userId
        };
    });
        
    res.status(200).json(trxSuccessfullsWithInvestor);
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
