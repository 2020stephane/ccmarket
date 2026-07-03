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
import { verifierAuthentification } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route publique
router.post('/inscription', sInscrire);

// Route protégée
router.delete('/delete/:id', verifierAuthentification, supprimerUtilisateur);

export default router;
