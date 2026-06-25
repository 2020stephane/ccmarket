/**
 * =======================================================
 *  @fileoverview  postman.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */
import express from 'express';
import {
   getAnnonces,
   getAnnonceById,
   postAnnonce,
   putAnnonce,
   patchAnnonce,
   deleteAnnonce,
} from '../controllers/postmanControllers.js';

const router = express.Router();
// ==================================================
// routes pour le CRUD POSTMAN
// ==================================================
router.get('/',       getAnnonces);
router.get('/:id',    getAnnonceById);
router.post('/',      postAnnonce);
router.put('/:id',    putAnnonce);
router.patch('/:id',  patchAnnonce);
router.delete('/:id', deleteAnnonce);

export default router;
