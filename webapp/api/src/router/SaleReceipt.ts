import { addSaleReceipt } from "../controllers/SaleReceipt";
import express from "express";

export default (router: express.Router) => {
    // router.get('/bonds', getAllBonds)
    router.post('/createSaleReceipt', addSaleReceipt)

}