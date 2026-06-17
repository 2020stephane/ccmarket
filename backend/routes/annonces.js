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
   getAjouts
} from '../controllers/annoncesControllers.js';

const router = express.Router();
// ==================================================
// routes ajoutes pour mon projet
// ==================================================
router.get('/derniers_ajouts', getAjouts);
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
