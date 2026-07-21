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
     supprimerUtilisateur,
     getUtilisateurPublic,
     patchUtilisateur,
     patchMotDePasse,
     sInscrire,
     connexionGoogle,
     connexionStandard,
     deconnexion,
     status
} from '../controllers/utilisateursControllers.js';
import { verifierAuthentification } from '../middlewares/authMiddleware.js';





/**
 * Routeur Express dédié aux utilisateurs.
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


/**
 * Route publique : récupère les informations publiques d'un utilisateur.
 * Ne nécessite pas d'authentification.
 * @name GET/:id/public
 * @function
 * @param {string} path - `/:id/public`
 * @param {Function} getUtilisateurPublic - Contrôleur renvoyant les infos
 * publiques de l'utilisateur ciblé par `id`.
 */
router.get('/:id/public', getUtilisateurPublic);

/**
 * Route publique : inscription d'un nouvel utilisateur.
 * @name POST/
 * @function
 * @param {string} path - `/`
 * @param {Function} sInscrire - Contrôleur créant l'utilisateur en bdd.
 */
router.post('/', sInscrire);

/**
 * Route protégée : met à jour les informations d'un utilisateur
 * (hors mot de passe). Nécessite un utilisateur authentifié.
 * @name PATCH/:id
 * @function
 * @param {string} path - `/:id`
 * @param {Function} verifierAuthentification - Middleware vérifiant que l'utilisateur est connecté.
 * @param {Function} patchUtilisateur - Contrôleur mettant à jour l'utilisateur ciblé par `id`.
 */
router.patch('/:id', verifierAuthentification, patchUtilisateur);

/**
 * Route protégée : met à jour le mot de passe d'un utilisateur.
 * Nécessite un utilisateur authentifié.
 * @name PATCH/mdp/:id
 * @function
 * @param {string} path - `/mdp/:id`
 * @param {Function} verifierAuthentification - Middleware vérifiant que l'utilisateur est connecté.
 * @param {Function} patchMotDePasse - Contrôleur mettant à jour le mot de passe de l'utilisateur ciblé par `id`.
 */
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
router.delete('/:id', verifierAuthentification, supprimerUtilisateur);

export default router;
