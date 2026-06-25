//===========================================================
//    FICHIER : annonces.js
//    PROJET  : ccmarket
//    DATE    : 16/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import express from 'express';
import {
   getAjouts,
   getAnnoncesByUser,
   getAnnoncesByFilter,
   publierAnnonce
} from '../controllers/annoncesControllers.js';

const router = express.Router();
// ==================================================
// routes ajoutées pour mon projet
// ==================================================
router.get('/derniers_ajouts', getAjouts);
router.get('/mesannonces/:id', getAnnoncesByUser);
router.post('/recherche', getAnnoncesByFilter);
router.post('/publierannonce', publierAnnonce);

export default router;
