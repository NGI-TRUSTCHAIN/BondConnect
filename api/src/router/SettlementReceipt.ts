import { addSettlementReceipt } from "../controllers/SettlementReceipt";
import express, { Router } from "express";

export default (router: express.Router) => {
    // router.get('/bonds', getAllBonds)
    router.post('/createSettlementReceipt', addSettlementReceipt)

}