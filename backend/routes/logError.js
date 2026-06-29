/**
 * =======================================================
 *  @fileoverview  logError.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-06-27
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */
import express from 'express';
import {
   sauveError
} from '../controllers/errorControllers.js';

const router = express.Router();

router.post("/", sauveError);

export default router;
