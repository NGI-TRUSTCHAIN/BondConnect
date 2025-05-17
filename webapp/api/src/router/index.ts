import express from "express";
import bonds from "./bonds";
import BlockchainTransfer from "./BlockchainTransfer";
import SaleReceipt from "./SaleReceipt";
import SettlementReceipt from "./SettlementReceipt";
import PurchaseUser from "./PurchaseUser";

const router = express.Router();

export default (): express.Router => {
  bonds(router)
  BlockchainTransfer(router)
  SaleReceipt(router)
  SettlementReceipt(router)
  PurchaseUser(router)
  return router;
};
