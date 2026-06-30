//===========================================================
//    FICHIER : utilisateurs.js
//    PROJET  : ccmarket
//    DATE    : 18/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import express from 'express';
import {
   sInscrire,
   supprimerUtilisateur
} from '../controllers/utilisateursControllers.js';

const router = express.Router();
// ==================================================
// routes ajoutées pour mon projet
// ==================================================
router.post('/inscription', sInscrire);
router.delete('/delete/:id',supprimerUtilisateur);

export default router;
