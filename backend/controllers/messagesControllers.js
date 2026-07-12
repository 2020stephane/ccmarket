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
      console.log('Insert result:', result);
      res.status(201).json({ message: 'Message enregistré', id: result.insertId });
   } catch (error) {
      logError(error, "FONCTION: postMessage, MODULE: messagesControllers2.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
export async function getMessages(req, res) {
  try {
    const { id } = req.params;

    const sql = `SELECT m.*,
          a.titre AS annonce_titre,
          a.date_publication,
        CASE
            WHEN m.expediteur_id = ? THEN 'Envoyé'
            WHEN m.destinataire_id = ? THEN 'Reçu'
        END AS type_message,
        CASE
            WHEN a.utilisateur_id = ? THEN 'Offre'
            ELSE 'Demande'
        END AS type_annonce
        FROM messages m
        JOIN annonces a ON m.annonce_id = a.annonce_id
        WHERE m.expediteur_id = ?
           OR m.destinataire_id = ?
        ORDER BY type_annonce, type_message, m.date_envoi DESC`;

    const params = [ id, id, id, id, id];
    const [result] = await db.execute(sql, params);

    res.status(200).json({ result });
  } catch (error) {
    logError(error, "FONCTION: getMessages, MODULE: messagesControllers.js");
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
