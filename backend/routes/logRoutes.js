/**
 * =======================================================
 *  @fileoverview  logRoutes.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */
import { Router } from "express";
import { logError } from "../tools/logger.js";

const router = Router();

/**
 * POST /api/log-error
 * Reçoit les erreurs du frontend et les enregistre dans errors.json
 */
router.post("/log-error", (req, res) => {
  const { message, contexte, stack, url, extra = {} } = req.body;

  if (!message) {
    return res.status(400).json({ erreur: "Le champ 'message' est obligatoire." });
  }

  const err = new Error(message);
  if (stack) err.stack = stack;

  logError(err, contexte || "frontend (non précisé)", { url, ...extra }, "frontend");

  res.status(200).json({ statut: "enregistré" });
});

export default router;
