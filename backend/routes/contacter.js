/**
 * @fileoverview Déclaration de la route permettant de contacter
 * l'administrateur du site.
 * @module contacter
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-21
 * @author Stephane Brisse
 * @license MIT
 * @requires express
 * @requires ../controllers/contacterControllers.js
 */

import express from 'express';
import {
   contacterAdmin
} from '../controllers/contacterControllers.js';

/**
 * Routeur Express dédié au contact.
 * @type {express.Router}
 * @const
 */
const router = express.Router();

/**
 * Route publique : envoie un message à l'administrateur du site.
 * @name POST/contacter
 * @function
 * @param {string} path - `/contacter`
 * @param {Function} contacterAdmin - Contrôleur traitant et transmettant le message à l'administrateur.
 */
router.post('/contacter', contacterAdmin);

export default router;
