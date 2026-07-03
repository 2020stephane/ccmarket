/**
 * @fileoverview Contrôleur CRUD sur les annonces, utilisé pour les
 * tests via Postman.
 * @module postmanControllers
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-24
 * @author Stephane Brisse
 * @license MIT
 * @requires ../tools/logger.js
 * @requires ../bdd/db.js
 */

import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';

/**
 * Extrait toutes les annonces de la base de données.
 * @function getAnnonces
 * @async
 * @param {express.Request} req - Requête Express.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Succès, retourne un tableau (json) contenant toutes les annonces.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function getAnnonces(req, res) {
   try {
      const [annonces] = await db.execute(
         'SELECT * FROM annonces '
      );
      res.status(200).json(annonces);
   } catch (error) {
      logError(error, "FONCTION: getAnnonces, MODULE: postmanControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}

/**
 * Récupère une annonce à partir de son identifiant.
 * @function getAnnonceById
 * @async
 * @param {express.Request} req - Requête Express, `params.id` = identifiant de l'annonce recherchée.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Succès, retourne l'annonce trouvée.
 *   - 404 : Annonce introuvable.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function getAnnonceById(req, res) {
   try {
      const [rows] = await db.execute(
         'SELECT * FROM annonces WHERE annonce_id = ?', [req.params.id]
      );
      if (rows.length === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }
      const annonce = rows[0];
      res.status(200).json(annonce);
   } catch (error) {
      logError(error, "FONCTION: getAnnonceById, MODULE: postmanControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}

/**
 * Crée une nouvelle annonce.
 * @function postAnnonce
 * @async
 * @param {express.Request} req - Requête Express, `body` attendu : `{ titre, descriptif, prix, categorie_id, utilisateur_id }`.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 201 : Annonce créée, retourne son identifiant.
 *   - 400 : Champs obligatoires manquants.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function postAnnonce(req, res) {
   const { titre, descriptif, prix, categorie_id, utilisateur_id } = req.body;

   if (!titre || !descriptif || !prix || !categorie_id || !utilisateur_id) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
   }

   try {
      const [result] = await db.execute(
         'INSERT INTO annonces (titre, descriptif, prix, categorie_id, utilisateur_id) VALUES (?, ?, ?, ?, ?)',
         [titre, descriptif, prix, categorie_id, utilisateur_id]
      );
      res.status(201).json({ message: 'Annonce créée', id: result.insertId });
   } catch (error) {
      logError(error, "FONCTION: postAnnonce, MODULE: postmanControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}

/**
 * Remplace intégralement une annonce existante.
 * @function putAnnonce
 * @async
 * @param {express.Request} req - Requête Express, `params.id` = identifiant de l'annonce, `body` attendu : `{ titre, descriptif, prix, utilisateur_id, categorie_id }`.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Annonce mise à jour.
 *   - 400 : Champs obligatoires manquants.
 *   - 404 : Annonce introuvable.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function putAnnonce(req, res) {
   const { titre, descriptif, prix, utilisateur_id, categorie_id } = req.body;

   if (!titre || !descriptif || !prix || !utilisateur_id|| !categorie_id) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
   }

   try {
      const [result] = await db.execute(
         'UPDATE annonces SET titre = ?, descriptif = ?, prix = ?, utilisateur_id = ?,categorie_id = ? WHERE annonce_id = ?',
         [titre, descriptif, prix, utilisateur_id, categorie_id ?? null, req.params.id]
      );
      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }
      res.json({ message: 'Annonce mise à jour' });
   } catch (error) {
      logError(error, "FONCTION: putAnnonce, MODULE: postmanControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}

/**
 * Modifie partiellement une annonce existante (uniquement les
 * colonnes autorisées : `titre`, `descriptif`, `prix`, `categorie_id`).
 * @function patchAnnonce
 * @async
 * @param {express.Request} req - Requête Express, `params.id` = identifiant de l'annonce, `body` = champs à mettre à jour.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Annonce mise à jour partiellement.
 *   - 400 : Aucun champ valide fourni.
 *   - 404 : Annonce introuvable.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function patchAnnonce(req, res) {
   const champs = req.body;
   const colonnesAutorisees = ['titre', 'descriptif', 'prix', 'categorie_id'];

   const entrees = Object.entries(champs).filter(([col]) =>
      colonnesAutorisees.includes(col)
   );

   if (entrees.length === 0) {

      return res.status(400).json({ message: 'Aucun champ valide fourni' });
   }

   const setClause = entrees.map(([col]) => `${col} = ?`).join(', ');
   const valeurs = entrees.map(([, val]) => val);

   try {
      const [result] = await db.execute(
         `UPDATE annonces SET ${setClause} WHERE annonce_id = ?`,
         [...valeurs, req.params.id]
      );
      if (result.affectedRows === 0) {

         return res.status(404).json({ message: 'Annonce introuvable' });
      }

      res.json({ message: 'Annonce mise à jour partiellement' });
   } catch (error) {
      logError(error, "FONCTION: patchAnnonce, MODULE:postmanControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}

/**
 * Supprime une annonce existante.
 * @function deleteAnnonce
 * @async
 * @param {express.Request} req - Requête Express, `params.id` = identifiant de l'annonce à supprimer.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Annonce supprimée.
 *   - 404 : Annonce introuvable.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function deleteAnnonce(req, res) {
   try {
      const [result] = await db.execute(
         'DELETE FROM annonces WHERE annonce_id = ?',
         [req.params.id]
      );
      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }
      res.json({ message: 'Annonce supprimée' });
   } catch (error) {
     logError(error, "FONCTION: deleteAnnonce, MODULE:postmanControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
