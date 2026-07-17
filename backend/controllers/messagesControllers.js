/**
 * =======================================================
 *  @fileoverview  messagesControllers.js
 *  @project       ccmarket
 *  @description   Contrôleurs de gestion de la messagerie :
 *                 création de messages, récupération des
 *                 conversations d'un utilisateur, et
 *                 récupération de l'ensemble des messages
 *                 (vue administrateur/modération).
 *  @module        messagesControllers
 *  @version       1.0.2
 *  @date          2026-07-17
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';

/**
 * @typedef {Object} ExpressRequest
 * @description Objet requête Express (voir la documentation officielle Express).
 */

/**
 * @typedef {Object} ExpressResponse
 * @description Objet réponse Express (voir la documentation officielle Express).
 */

/**
 * Crée un nouveau message entre deux utilisateurs, lié à une annonce.
 * Le champ `moderation_id` reste `NULL` à la création : une modération
 * n'est associée au message que si celui-ci est signalé ultérieurement.
 *
 * @async
 * @function postMessage
 * @param {ExpressRequest} req - Requête Express.
 * @param {Object} req.body - Corps de la requête.
 * @param {string} req.body.contenu - Contenu textuel du message.
 * @param {number|string} req.body.annonce_id - Identifiant de l'annonce concernée.
 * @param {number|string} req.body.expediteur_id - Identifiant de l'utilisateur expéditeur.
 * @param {number|string} req.body.destinataire_id - Identifiant de l'utilisateur destinataire.
 * @param {ExpressResponse} res - Réponse Express.
 * @returns {Promise<void>} Envoie une réponse JSON :
 *  - 201 avec l'identifiant du message créé (`id`) en cas de succès,
 *  - 400 si un champ obligatoire est manquant,
 *  - 500 en cas d'erreur serveur.
 */
export async function postMessage(req, res) {
  const { contenu, annonce_id, expediteur_id, destinataire_id } = req.body;

  if (!contenu || !annonce_id || !expediteur_id || !destinataire_id) {
    return res.status(400).json({ message: 'Champs obligatoires manquants' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO messages (contenu, annonce_id, expediteur_id, destinataire_id) VALUES (?, ?, ?, ?)',
      [contenu, annonce_id, expediteur_id, destinataire_id]
    );

    res.status(201).json({ message: 'Message enregistré', id: result.insertId });
  } catch (error) {
    logError(error, "FONCTION: postMessage, MODULE: messagesControllers.js");
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

/**
 * Récupère l'ensemble des messages (envoyés et reçus) liés à un utilisateur donné,
 * en précisant pour chaque message son type ("Envoyé"/"Reçu") ainsi que le type
 * d'annonce associé ("Offre"/"Demande"), avec les informations (nom, prénom,
 * avatar) de l'expéditeur et du destinataire.
 *
 * @async
 * @function getMessages
 * @param {ExpressRequest} req - Requête Express.
 * @param {Object} req.params - Paramètres de route.
 * @param {number|string} req.params.id - Identifiant de l'utilisateur dont on récupère les messages.
 * @param {ExpressResponse} res - Réponse Express.
 * @returns {Promise<void>} Envoie une réponse JSON :
 *  - 200 avec la liste des messages (`result`) en cas de succès,
 *  - 400 si l'identifiant est manquant ou invalide,
 *  - 500 en cas d'erreur serveur.
 */
export async function getMessages(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Identifiant utilisateur manquant ou invalide' });
    }

    const sql = `
      SELECT v.*,
        CASE
            WHEN v.expediteur_id = ? THEN 'Envoyé'
            WHEN v.destinataire_id = ? THEN 'Reçu'
        END AS type_message,
        CASE
            WHEN v.annonce_proprietaire_id = ? THEN 'Offre'
            ELSE 'Demande'
        END AS type_annonce
      FROM vue_messages_detail v
      WHERE v.expediteur_id = ?
         OR v.destinataire_id = ?
      ORDER BY type_annonce, type_message, v.date_envoi DESC`;

    const params = [id, id, id, id, id];
    const [result] = await db.execute(sql, params);

    res.status(200).json({ result });
  } catch (error) {
    logError(error, "FONCTION: getMessages, MODULE: messagesControllers.js");
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

/**
 * Récupère l'ensemble des messages de la plateforme, tous utilisateurs
 * confondus, avec les informations essentielles de l'annonce concernée,
 * de l'expéditeur et du destinataire. Destinée à un usage administrateur
 * ou modération (pas de filtrage par utilisateur connecté).
 *
 * @async
 * @function getAllMessages
 * @param {ExpressRequest} req - Requête Express.
 * @param {ExpressResponse} res - Réponse Express.
 * @returns {Promise<void>} Envoie une réponse JSON :
 *  - 200 avec la liste complète des messages (`messages`) en cas de succès,
 *  - 500 en cas d'erreur serveur.
 */
export async function getAllMessages(req, res) {
   try {
      const [messages] = await db.execute(`
    SELECT * FROM vue_messages_complets
    ORDER BY date_envoi DESC
`);

      res.status(200).json({ messages });

   } catch (error) {
      logError(error, "FONCTION: getAllMessages, MODULE: messagesController.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
