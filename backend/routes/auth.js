/**
 *  Routes pour l'authentification
 *
 *  @fileoverview  auth.js
 *  @project       ccmarket
 *  @version       1.0.0
 *  @date          2026-06-27
 *  @author        Stephane Brisse
 *  @license       MIT
 */
import express from 'express';
import {
   connexionGoogle,
   connexionStandard,
   deconnexion,
   status
} from '../controllers/authControllers.js';

const router = express.Router();
// ==================================================
// routes ajoutées pour mon projet
// ==================================================
router.post('/loginGoogle', connexionGoogle);
router.post('/loginStandard', connexionStandard);
router.post('/logout', deconnexion);
router.get('/status', status);

export default router;
