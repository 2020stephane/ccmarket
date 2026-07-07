/**
 * =======================================================
 *  @fileoverview  messages.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-07-06
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */

import express from 'express';
import {
   getMessagesR,
   getMessagesE,
} from '../controllers/messagesControllers.js';
import { verifierAuthentification } from '../middlewares/authMiddleware.js';
/**
 * Routeur Express dédié aux annonces.
 * @type {express.Router}
 * @const
 */
const router = express.Router();

/**
 * Route publique : récupère les dernièrs messages recus.
 * @name GET/messages_recus
 * @function
 * @param {string} path - `/derniers_ajouts`
 * @param {Function} getAjouts - Contrôleur renvoyant les annonces les plus récentes.
 */
router.get('/messages_recus/:id', getMessagesR);
/**
 * Route publique : récupère les dernièrs messages envoyes.
 * @name GET/messages_envoyes
 * @function
 * @param {string} path - `/derniers_ajouts`
 * @param {Function} getAjouts - Contrôleur renvoyant les annonces les plus récentes.
 */
router.get('/messages_envoyes/:id', getMessagesE);

export default router;
