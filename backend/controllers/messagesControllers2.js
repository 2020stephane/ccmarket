/**
 * =======================================================
 *  @fileoverview  messagesControllers.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-07-06
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import path from 'path';
import jwt from 'jsonwebtoken';

import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';

/**
 * Clé secrète utilisée pour signer/vérifier les jetons JWT.
 * @type {string}
 * @const
 */
const JWT_SECRET = process.env.JWT_SECRET;

export async function getMessagesR(req, res) {
  try {
   const userid = req.params.id;
   const [fiches] = await db.execute(`SELECT * FROM messages WHERE destinataire_id = ?`,[userid]);

    res.json(fiches);
  } catch (error) {
    logError(error, "function getMessagesR dans le module:messagesControllers.js");
    res.status(500).json({ message: "Erreur serveur" });
  }
}
export async function getMessagesE(req, res) {
  try {
   const userid = req.params.id;
   const [fiches] = await db.execute(`SELECT * FROM messages WHERE expediteur_id = ?`,[userid]);

    res.json(fiches);
  } catch (error) {
    logError(error, "function getMessagesR dans le module:messagesControllers.js");
    res.status(500).json({ message: "Erreur serveur" });
  }
}
export async function postMessage(req, res) {
   const { contenu, annonce_id, expediteur_id, destinataire_id } = req.body;

   if (!contenu || !annonce_id || !expediteur_id || !destinataire_id ) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
   }

   try {
      const [result] = await db.execute(
         'INSERT INTO messages (contenu, annonce_id, expediteur_id, destinataire_id) VALUES (?, ?, ?, ?)',
         [contenu, annonce_id, expediteur_id, destinataire_id]
      );
      res.status(201).json({ message: 'Message enregistré', id: result.insertId });
   } catch (error) {
      logError(error, "FONCTION: postMessage, MODULE: messagesControllers2.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
