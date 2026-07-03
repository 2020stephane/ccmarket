/**
 * @fileoverview  Routes por les annonces
 * @project       ccmarket
 * @version       1.0.0
 * @date          2026-07-01
 * @author        Stephane Brisse
 * @license       MIT
 */
import express from 'express';
import {
   getAjouts,
   getAnnoncesByUser,
   getAnnoncesByFilter,
   patchAnnonce,
   publierAnnonce,
   supprimerAnnonce
} from '../controllers/annoncesControllers.js';
import { verifierAuthentification } from '../middlewares/authMiddleware.js';

const router = express.Router();
// ==================================================
// routes publiques
// ==================================================
router.get('/derniers_ajouts', getAjouts);
router.get('/recherche', getAnnoncesByFilter);
// ==================================================
// Routes protégées — utilisateur connecté requis
// ==================================================
router.get('/mesannonces/:id', verifierAuthentification, getAnnoncesByUser);
router.patch('/modifierannonce/:id', verifierAuthentification, patchAnnonce);
router.post('/publierannonce', verifierAuthentification, publierAnnonce);
router.delete('/supprimerannonce/:id', verifierAuthentification, supprimerAnnonce);

export default router;
