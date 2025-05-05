import { addTransferTicket, getTransferHistory } from "../controllers/BlockchainTransfer";
import express, { Router } from "express";

export default (router: express.Router) => {
    // router.get('/bonds', getAllBonds)
    router.post('/api/createTransferHistoric', addTransferTicket)
    router.get('/transferHistory', getTransferHistory)
}