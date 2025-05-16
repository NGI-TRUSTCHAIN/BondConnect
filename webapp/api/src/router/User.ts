import { getUsers } from "../db/User";
import { purchase, getAllUsers } from "../controllers/User";
import express from "express";
import { getAllIssuers, registerIssuer } from "../controllers/Issuer";
import { getAllInvestors, registerInvestor } from "../controllers/Investor";
import { login } from "../controllers/auth";

export default (router: express.Router) => {
    router.post('/register-purchase', purchase)
    router.get('/users', getAllUsers)
    router.post('/register-issuer', registerIssuer)
    router.get('/issuers', getAllIssuers)
    router.post('/register-investor', registerInvestor)
    router.get('/investors', getAllInvestors)
    router.post('/login', login)
}