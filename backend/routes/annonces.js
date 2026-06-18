//===========================================================
//    FICHIER : annonces.js
//    PROJET  : ccmarket
//    DATE    : 16/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import express from 'express';
import {
   getAnnonces,
   getAnnonceById,
   createAnnonce,
   updateAnnonce,
   patchAnnonce,
   deleteAnnonce,
   getAjouts,
   getAnnoncesByUser,
   getAnnoncesByFilter,
   postAnnonce
} from '../controllers/annoncesControllers.js';

const router = express.Router();
// ==================================================
// routes ajoutées pour mon projet
// ==================================================
router.get('/derniers_ajouts', getAjouts);
router.get('/mesannonces/:id', getAnnoncesByUser);
router.post('/recherche', getAnnoncesByFilter);
router.post('/publierannonce', postAnnonce);

// ==================================================
// routes pour le CRUD
// ==================================================
router.get('/',       getAnnonces);
router.get('/:id',    getAnnonceById);
router.post('/',      createAnnonce);
router.put('/:id',    updateAnnonce);
router.patch('/:id',  patchAnnonce);
router.delete('/:id', deleteAnnonce);

export default router;
