/**
 * @fileoverview Contrôleur de journalisation des erreurs remontées
 * par le frontend.
 * @module errorControllers
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-27
 * @author Stephane Brisse
 * @license MIT
 * @requires ../tools/logger.js
 */

import { logError } from '../tools/logger.js';

/**
 * Enregistre une erreur survenue côté client (frontend) dans le
 * système de journalisation applicatif.
 * @function sauveError
 * @async
 * @param {express.Request} req - Requête Express, `body` attendu : `{ message, contexte, stack, url, extra }` (`message` obligatoire, le reste optionnel).
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Erreur enregistrée avec succès.
 *   - 400 : Champ `message` manquant.
 */
export async function sauveError(req, res) {
     const { message, contexte, stack, url, extra = {} } = req.body;

       if (!message) {
         return res.status(400).json({ erreur: "Le champ 'message' est obligatoire." });
       }

       const err = new Error(message);
       if (stack) err.stack = stack;

       logError(err, contexte || "frontend (non précisé)", { url, ...extra }, "frontend");

       res.status(200).json({ statut: "enregistré" });


}
