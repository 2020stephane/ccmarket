//===========================================================
//    FICHIER : utilisateurs.js
//    PROJET  : ccmarket
//    DATE    : 18/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import express from 'express';
import {
   seConnecter,
   seDeconnecter
} from '../controllers/utilisateursControllers.js';

const router = express.Router();
// ==================================================
// routes ajoutées pour mon projet
// ==================================================
router.post('/connection', seConnecter);
router.post('/deconnection', seDeconnecter);

export default router;
