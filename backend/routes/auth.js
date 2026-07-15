/**
 * @fileoverview Déclaration des routes liées à l'authentification
 * (connexion standard, connexion Google, déconnexion, statut de session).
 * @module auth
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-27
 * @author Stephane Brisse
 * @license MIT
 * @requires express
 * @requires ../controllers/authControllers.js
 */

import express from 'express';
import {
   connexionGoogle,
   connexionStandard,
   deconnexion,
   status
} from '../controllers/authControllers.js';

/**
 * Routeur Express dédié à l'authentification.
 * @type {express.Router}
 * @const
 */
const router = express.Router();

/**
 * Route publique : connexion via un compte Google (OAuth).
 * @name POST/loginGoogle
 * @function
 * @param {string} path - `/loginGoogle`
 * @param {Function} connexionGoogle - Contrôleur vérifiant le jeton Google et ouvrant la session.
 */
router.post('/google', connexionGoogle);

/**
 * Route publique : connexion via identifiant / mot de passe.
 * @name POST/loginStandard
 * @function
 * @param {string} path - `/loginStandard`
 * @param {Function} connexionStandard - Contrôleur vérifiant les identifiants et ouvrant la session.
 */
router.post('/loginStandard', connexionStandard);

/**
 * Route publique : déconnexion de l'utilisateur, ferme la session en cours.
 * @name POST/logout
 * @function
 * @param {string} path - `/logout`
 * @param {Function} deconnexion - Contrôleur détruisant la session/le cookie d'authentification.
 */
router.post('/logout', deconnexion);

/**
 * Route publique : renvoie le statut de connexion de l'utilisateur courant.
 * @name GET/status
 * @function
 * @param {string} path - `/status`
 * @param {Function} status - Contrôleur renvoyant l'état de la session (connecté ou non).
 */
router.get('/status', status);

export default router;
