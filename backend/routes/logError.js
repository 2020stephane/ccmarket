/**
 * @fileoverview Déclaration de la route permettant d'enregistrer
 * les erreurs remontées par le frontend.
 * @module logError
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-27
 * @author Stephane Brisse
 * @license MIT
 * @requires express
 * @requires ../controllers/errorControllers.js
 */

import express from 'express';
import {
   sauveError
} from '../controllers/errorControllers.js';

/**
 * Routeur Express dédié à la journalisation des erreurs.
 * @type {express.Router}
 * @const
 */
const router = express.Router();

/**
 * Route publique : enregistre une erreur survenue côté client.
 * @name POST/
 * @function
 * @param {string} path - `/`
 * @param {Function} sauveError - Contrôleur sauvegardant l'erreur reçue (log fichier/base de données).
 */
router.post("/", sauveError);

export default router;
