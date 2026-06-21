//===========================================================
//    FICHIER : contacter.js
//    PROJET  : ccmarket
//    DATE    : 21/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import express from 'express';
import {
   contacterAdmin
} from '../controllers/contacterControllers.js';

const router = express.Router();
// ==================================================
// routes ajoutées pour mon projet
// ==================================================
router.post('/contacter', contacterAdmin);

export default router;
