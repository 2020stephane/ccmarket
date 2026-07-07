/**
 * =======================================================
 *  @fileoverview  messagesControllers.js
 *  @project       ccmarket
 *  @description   Contrôleurs de la messagerie : récupération
 *                  des messages reçus / envoyés, enrichis avec
 *                  le titre de l'annonce, son propriétaire, et
 *                  le nom de l'expéditeur / destinataire.
 *  @version       1.1.0
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

/**
 * Requête commune aux deux routes : on joint `annonces` pour
 * récupérer le titre et le propriétaire (utile côté front pour
 * savoir si le message concerne une annonce que l'utilisateur a
 * publiée, ou une annonce d'un autre membre), et `utilisateurs`
 * (x2, alias) pour récupérer le nom de l'expéditeur ET du
 * destinataire.
 *
 * Adaptez les noms de colonnes (annonce_id, titre, id_utilisateur,
 * prenom, nom) s'ils diffèrent dans votre schéma réel.
 */
const SELECT_MESSAGES_ENRICHIS = `
  SELECT
    m.message_id,
    m.contenu,
    m.date_envoi,
    m.annonce_id,
    m.expediteur_id,
    m.destinataire_id,
    a.titre           AS annonce_titre,
    a.utilisateur_id  AS annonce_proprietaire_id,
    CONCAT(ue.prenom, ' ', ue.nom) AS expediteur_nom,
    CONCAT(ud.prenom, ' ', ud.nom) AS destinataire_nom
  FROM messages m
  JOIN annonces a        ON a.annonce_id = m.annonce_id
  JOIN utilisateurs ue   ON ue.utilisateur_id = m.expediteur_id
  JOIN utilisateurs ud   ON ud.utilisateur_id = m.destinataire_id
`;

export async function getMessagesR(req, res) {
  try {
    const userid = req.params.id;
    const [fiches] = await db.execute(
      `${SELECT_MESSAGES_ENRICHIS} WHERE m.destinataire_id = ? ORDER BY m.date_envoi ASC`,
      [userid]
    );

    res.json(fiches);
  } catch (error) {
    logError(error, "function getMessagesR dans le module:messagesControllers.js");
    res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function getMessagesE(req, res) {
  try {
    const userid = req.params.id;
    const [fiches] = await db.execute(
      `${SELECT_MESSAGES_ENRICHIS} WHERE m.expediteur_id = ? ORDER BY m.date_envoi ASC`,
      [userid]
    );

    res.json(fiches);
  } catch (error) {
    logError(error, "function getMessagesE dans le module:messagesControllers.js");
    res.status(500).json({ message: "Erreur serveur" });
  }
}
