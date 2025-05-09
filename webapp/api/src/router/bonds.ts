import express, { Router } from "express";
import { addBond, getAllBonds, updateBond } from "../controllers/bonds";
import { addBondDraft } from "../controllers/bondDrafts";
import { addRetailMktBond } from "../controllers/RetailMktBonds";

export default (router: express.Router) => {
    router.get('/bonds', getAllBonds)
    router.post('/create', addBond)
    router.post('/save', addBondDraft)
    router.put('/update/:id', updateBond)
    router.post('/addToMarket', addRetailMktBond)
}