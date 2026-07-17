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
   getMessages,
   postMessage,
   getAllMessages
} from '../controllers/messagesControllers.js';

import { verifierAuthentification } from '../middlewares/authMiddleware.js';
/**
 * Routeur Express dédié aux messages.
 * @type {express.Router}
 * @const
 */
const router = express.Router();

router.get('/get',getAllMessages);
router.get('/get/:id',getMessages);
router.post('/post', postMessage);

export default router;
