/**
 * @fileoverview Déclaration des routes liées aux utilisateurs
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
     getUtilisateurPublic,
     patchUtilisateur,
     patchMotDePasse,
     deleteUserAccount
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
 * @name POST/
 * @function
 * @param {string} path - `/`
 * @param {Function} sInscrire - Contrôleur créant l'utilisateur en bdd.
 */
router.post('/', sInscrire);
router.get('/:id/public', getUtilisateurPublic);
router.patch('/:id', verifierAuthentification, patchUtilisateur);
router.patch('/mdp/:id', verifierAuthentification, patchMotDePasse);
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
router.delete('/:id', verifierAuthentification, deleteUserAccount);
export default router;
