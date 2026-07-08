/**
 * @fileoverview Déclaration des routes liées aux utilisateurs
 * (inscription, suppression de compte).
 * @module utilisateurs
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-18
 * @author Stephane Brisse
 * @license MIT
 * @requires express
 * @requires ../controllers/utilisateursControllers.js
 * @requires ../middlewares/authMiddleware.js
 */

import express from 'express';
import {
   sInscrire,
   supprimerUtilisateur,
   getUtilisateurPublic
} from '../controllers/utilisateursControllers.js';
import { verifierAuthentification } from '../middlewares/authMiddleware.js';

/**
 * Routeur Express dédié aux utilisateurs.
 * @type {express.Router}
 * @const
 */
const router = express.Router();

/**
 * Route publique : inscription d'un nouvel utilisateur.
 * @name POST/inscription
 * @function
 * @param {string} path - `/inscription`
 * @param {Function} sInscrire - Contrôleur créant l'utilisateur en base.
 */
router.post('/inscription', sInscrire);
router.get('/:id/public', getUtilisateurPublic);
/**
 * Route protégée : suppression définitive d'un compte utilisateur.
 * Nécessite un utilisateur authentifié.
 * @name DELETE/delete/:id
 * @function
 * @param {string} path - `/delete/:id`
 * @param {Function} verifierAuthentification - Middleware vérifiant que l'utilisateur est connecté.
 * @param {Function} supprimerUtilisateur - Contrôleur supprimant l'utilisateur ciblé par `id`.
 */
router.delete('/delete/:id', verifierAuthentification, supprimerUtilisateur);

export default router;
