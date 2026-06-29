/**
 * =======================================================
 *  @fileoverview  postmanControllers.js
 *  @project       ccmarket
 *  @description   Contrôleur pour tester postman
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */

/**
 * =======================================================
 * IMPORTS INTERNES
 * =======================================================
 */
import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';
/**
 * =======================================================
 *  @function     getAnnonces
 *  @description  Extrait toutes les annonces de la base de données.
 *  @description  Triées par date de publication décroissante.
 *  @async
 * =======================================================
 *
 *  @param {import('express').Request}  req  - L'objet de requête Express
 *  @param {import('express').Response} res  - L'objet de réponse Express
 *
 *  @returns {Promise<import('express').Response>} Réponse HTTP :
 *    - 200 : Succès, retourne un tableau (json) contenant toutes les annonces.
 *    - 500 : Erreur interne du serveur (l'erreur est journalisée via logError).
 *
 * =======================================================
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
// ==================================================
// GET une annonce par ID
// ==================================================
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
// ==================================================
// POST créer une annonce
// ==================================================
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
// ==================================================
//  PUT modifier une annonce
// ==================================================
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
// ==================================================
// PATCH modifier partiellement une annonce
// ==================================================
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
// ==================================================
// DELETE supprimer une annonce
// ==================================================
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
