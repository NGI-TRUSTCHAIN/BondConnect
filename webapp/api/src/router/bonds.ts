import express, { Router } from "express";
import { addBond, getAllBonds, updateBond } from "../controllers/bonds";
import { addBondDraft } from "../controllers/bondDrafts";
// import { isAuthenticated, isOwner } from "../middlewares";

export default (router: express.Router) => {
    router.get('/bonds', getAllBonds)
    router.post('/create', addBond)
    router.post('/save', addBondDraft)
    router.put('/update/:id', updateBond)
}