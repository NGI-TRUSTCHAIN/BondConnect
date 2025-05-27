import express from "express";
import bonds from "./bonds";
import BlockchainTransfer from "./BlockchainTransfer";
import SaleReceipt from "./SaleReceipt";
import SettlementReceipt from "./SettlementReceipt";
import PurchaseUser from "./PurchaseUser";
import trx from "./trx";
const router = express.Router();

export default (): express.Router => {
  bonds(router)
  BlockchainTransfer(router)
  SaleReceipt(router)
  SettlementReceipt(router)
  PurchaseUser(router)
  trx(router)
  return router;
};
