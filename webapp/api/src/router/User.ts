import { getUsers } from "../db/User";
import { createNewUser, getAllUsers } from "../controllers/User";
import express from "express";
import { getAllIssuers, registerIssuer } from "../controllers/Issuer";
import { getAllInvestors, registerInvestor } from "../controllers/Investor";
import { login } from "../controllers/auth";

export default (router: express.Router) => {
    router.post('/register-user', createNewUser)
    router.get('/users', getAllUsers)
    router.post('/register-issuer', registerIssuer)
    router.get('/issuers', getAllIssuers)
    router.post('/register-investor', registerInvestor)
    router.get('/investors', getAllInvestors)
    router.post('/login', login)
}