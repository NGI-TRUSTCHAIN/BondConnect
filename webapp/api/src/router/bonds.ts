import express, { Router } from "express";
import { addBond, getAllBonds, updateBond, getBondsByUser } from "../controllers/bonds";
import { addBondDraft } from "../controllers/bondDrafts";
import { addRetailMktBond, getAllRetailMktBonds } from "../controllers/RetailMktBonds";

export default (router: express.Router) => {
    router.post('/bonds-user', getBondsByUser)
    router.get('/bonds/:userId', getAllBonds)
    router.post('/create', addBond)
    router.post('/save', addBondDraft)
    router.put('/update/:id', updateBond)
    router.post('/addToMarket', addRetailMktBond)
    router.get('/getAllMarketBonds', getAllRetailMktBonds)
}