/**
 * =======================================================
 *  @fileoverview  messagesControllers.js
 *  @project       ccmarket
 *  @description   gestion de la messagerie
 *  @version       1.0.1
 *  @date          2026-07-06
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';

/**
 * Crée un nouveau message entre deux utilisateurs, lié à une annonce,
 * et initialise une entrée de modération associée avec le statut "en attente".
 *
 * @async
 * @function postMessage
 * @param {import('express').Request} req - Requête Express.
 * @param {Object} req.body - Corps de la requête.
 * @param {string} req.body.contenu - Contenu textuel du message.
 * @param {number|string} req.body.annonce_id - Identifiant de l'annonce concernée.
 * @param {number|string} req.body.expediteur_id - Identifiant de l'utilisateur expéditeur.
 * @param {number|string} req.body.destinataire_id - Identifiant de l'utilisateur destinataire.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>} Envoie une réponse JSON :
 *  - 201 avec l'identifiant du message créé en cas de succès,
 *  - 400 si des champs obligatoires sont manquants,
 *  - 500 en cas d'erreur serveur.
 */
export async function postMessage(req, res) {
  const { contenu, annonce_id, expediteur_id, destinataire_id } = req.body;

  if (!contenu || !annonce_id || !expediteur_id || !destinataire_id) {
    return res.status(400).json({ message: 'Champs obligatoires manquants' });
  }

  try {
    const [resultModeration] = await db.execute(
      'INSERT INTO moderations (status) VALUES (?)',
      ['en attente']
    );
    const mod_id = resultModeration.insertId;

    const [result] = await db.execute(
      'INSERT INTO messages (contenu, annonce_id, expediteur_id, destinataire_id, moderation_id) VALUES (?, ?, ?, ?, ?)',
      [contenu, annonce_id, expediteur_id, destinataire_id, mod_id]
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
 * d'annonce associé ("Offre"/"Demande").
 *
 * @async
 * @function getMessages
 * @param {import('express').Request} req - Requête Express.
 * @param {Object} req.params - Paramètres de route.
 * @param {number|string} req.params.id - Identifiant de l'utilisateur dont on récupère les messages.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>} Envoie une réponse JSON :
 *  - 200 avec la liste des messages (`result`) en cas de succès,
 *  - 400 si l'identifiant est manquant,
 *  - 500 en cas d'erreur serveur.
 */
export async function getMessages(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Identifiant utilisateur manquant' });
    }

    const sql = `SELECT m.*,
          a.titre AS annonce_titre,
          a.date_publication,
          ue.nom AS expediteur_nom,
          ue.prenom AS expediteur_prenom,
          ue.avatar_url AS expediteur_avatar,
          ud.nom AS destinataire_nom,
          ud.prenom AS destinataire_prenom,
          ud.avatar_url AS destinataire_avatar,
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
        JOIN utilisateurs ue ON m.expediteur_id = ue.utilisateur_id
        JOIN utilisateurs ud ON m.destinataire_id = ud.utilisateur_id
        WHERE m.expediteur_id = ?
           OR m.destinataire_id = ?
        ORDER BY type_annonce, type_message, m.date_envoi DESC`;

    const params = [id, id, id, id, id];
    const [result] = await db.execute(sql, params);

    res.status(200).json({ result });
  } catch (error) {
    logError(error, "FONCTION: getMessages, MODULE: messagesControllers.js");
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
