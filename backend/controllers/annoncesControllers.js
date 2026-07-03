/**
 * @fileoverview Contrôleur de gestion des annonces (consultation,
 * recherche, publication, modification, suppression).
 * @module annoncesControllers
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-24
 * @author Stephane Brisse
 * @license MIT
 * @requires bcrypt
 * @requires url
 * @requires path
 * @requires jsonwebtoken
 * @requires ../tools/logger.js
 * @requires ../bdd/db.js
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
 * Chemin absolu du répertoire courant (équivalent de `__dirname` en ESM).
 * @type {string}
 * @const
 */
const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Remplace intégralement une annonce existante.
 * @function putAnnonce
 * @async
 * @param {import('express').Request} req - Requête Express, `params.id` = identifiant de l'annonce, `body` attendu : `{ titre, descriptif, prix, utilisateur_id, categorie_id }`.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<import('express').Response>} Réponse HTTP :
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
      logError(error, "fonction putAnnonce dans le module:annoncesControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}

/**
 * Modifie partiellement une annonce existante (uniquement les
 * colonnes autorisées : `titre`, `descriptif`, `prix`, `categorie_id`).
 * Seul le propriétaire de l'annonce ou un administrateur peut
 * effectuer cette action.
 * @function patchAnnonce
 * @async
 * @param {import('express').Request} req - Requête Express, `params.id` = identifiant de l'annonce, `body` = champs à mettre à jour, `user` = utilisateur authentifié.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<import('express').Response>} Réponse HTTP :
 *   - 200 : Annonce mise à jour partiellement.
 *   - 400 : Aucun champ valide fourni.
 *   - 403 : Utilisateur non autorisé (ni propriétaire, ni administrateur).
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

   try {
      // Vérification de propriété : l'annonce doit appartenir à l'utilisateur connecté
      const [rows] = await db.execute(
         'SELECT utilisateur_id FROM annonces WHERE annonce_id = ?',
         [req.params.id]
      );

      if (rows.length === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }

      const estProprietaire = rows[0].utilisateur_id === req.user.id;
      const estAdmin = !!req.user.administrateur;

      if (!estProprietaire && !estAdmin) {
         return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette annonce.' });
      }

      const setClause = entrees.map(([col]) => `${col} = ?`).join(', ');
      const valeurs = entrees.map(([, val]) => val);

      const [result] = await db.execute(
         `UPDATE annonces SET ${setClause} WHERE annonce_id = ?`,
         [...valeurs, req.params.id]
      );

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }

      res.json({ message: 'Annonce mise à jour partiellement' });
   } catch (error) {
      logError(error, "function patchAnnonce dans le module:annoncesControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}

/**
 * Supprime définitivement une annonce existante.
 * Seul le propriétaire de l'annonce ou un administrateur peut
 * effectuer cette action.
 * @function supprimerAnnonce
 * @async
 * @param {import('express').Request} req - Requête Express, `params.id` = identifiant de l'annonce, `user` = utilisateur authentifié.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<import('express').Response>} Réponse HTTP :
 *   - 200 : Annonce supprimée.
 *   - 403 : Utilisateur non autorisé (ni propriétaire, ni administrateur).
 *   - 404 : Annonce introuvable.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function supprimerAnnonce(req, res) {
   try {
      // Vérification de propriété
      const [rows] = await db.execute(
         'SELECT utilisateur_id FROM annonces WHERE annonce_id = ?',
         [req.params.id]
      );

      if (rows.length === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }

      const estProprietaire = rows[0].utilisateur_id === req.user.id;
      const estAdmin = !!req.user.administrateur;

      if (!estProprietaire && !estAdmin) {
         return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette annonce.' });
      }

      const [result] = await db.execute(
         'DELETE FROM annonces WHERE annonce_id = ?', [req.params.id]
      );

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }

      res.json({ message: 'Annonce supprimée' });
   } catch (error) {
     logError(error, "FONCTION: supprimerAnnonce, MODULE: annoncesControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}

/**
 * Récupère les 8 dernières annonces publiées, avec leurs photos associées.
 * @function getAjouts
 * @async
 * @param {import('express').Request} req - Requête Express.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<import('express').Response>} Réponse HTTP :
 *   - 200 : Succès, retourne un tableau des dernières annonces (avec leurs photos).
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function getAjouts(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT
        a.*,
        GROUP_CONCAT(p.photo_url) AS photos
      FROM annonces a
      LEFT JOIN photos p ON a.annonce_id = p.annonce_id
      GROUP BY a.annonce_id
      ORDER BY a.date_publication DESC
      LIMIT 8
    `);
    const annonces = rows.map(row => ({
      ...row,
      photos: row.photos ? row.photos.split(',') : []
    }));
    res.json(annonces);
  } catch (error) {
    logError(error, "function getAjouts dans le module:annoncesControllers.js");
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Récupère toutes les annonces publiées par un utilisateur donné,
 * enrichies de leurs photos et du nom de leur catégorie.
 * @function getAnnoncesByUser
 * @async
 * @param {import('express').Request} req - Requête Express, `params.id` = identifiant de l'utilisateur.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<import('express').Response>} Réponse HTTP :
 *   - 200 : Succès, retourne un tableau des annonces de l'utilisateur.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function getAnnoncesByUser(req, res) {
  try {
   const userid = req.params.id;
   const [fiches] = await db.execute(`SELECT * FROM annonces WHERE utilisateur_id = ?`,[userid]);
   const fichesAvecPhotos = await Promise.all(
      fiches.map(async (fiche) => {
        // Pour chaque annonce, on va chercher ses photos
        const [photosDeLAnnonce] = await db.execute(`SELECT * FROM photos WHERE annonce_id = ?`, [fiche.annonce_id]);
        const [nomCategorie] = await db.execute(`SELECT nom FROM categories WHERE categorie_id = ?`,[fiche.categorie_id]);
        return {
          ...fiche,
          categorie: nomCategorie,
          photos: photosDeLAnnonce
        };
      })
    );

    // 3. Renvoyer le résultat complet au frontend
    res.json(fichesAvecPhotos);
  } catch (error) {
    logError(error, "function getAnnoncesByUser dans le module:annoncesControllers.js");
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Recherche des annonces selon des critères de filtre (catégorie,
 * tri par date et/ou par prix).
 * @function getAnnoncesByFilter
 * @async
 * @param {import('express').Request} req - Requête Express, `body` attendu : `{ categorie, prixmin, prixmax, plus_ra, prix_cd }`.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<import('express').Response>} Réponse HTTP :
 *   - 200 : Succès, retourne un tableau des annonces correspondant aux filtres.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function getAnnoncesByFilter(req, res) {
   const { categorie, prixmin, prixmax, plus_ra, prix_cd } = req.body;
  try {
   let sql = 'SELECT * FROM annonces WHERE 1=1';
      let params = [];

      // Filtre Catégorie
      if (categorie !== 'tout') {
         sql += ' AND categorie = ?';
         params.push(categorie);
      }
// Filtre Prix (on convertit en nombre pour plus de sécurité)
      // if (prixmin && !isNaN(prixmin)) {
      //    sql += ' AND prix >= ?';
      //    params.push(Number(prixmin));
      // }
      // if (prixmax && !isNaN(prixmax)) {
      //    sql += ' AND prix <= ?';
      //    params.push(Number(prixmax));
      // }
      // if (plus_ra === 'recent') {
      //    sql += ' ORDER BY date_publication DESC';
      // }
      // else if (plus_ra === 'ancien') {
      //     sql += ' ORDER BY date_publication ASC';
      // }
      // if (prix_cd === 'crois') sql += ' ORDER BY prix ASC';
      // else if (prix_cd === 'decrois') sql += ' ORDER BY prix DESC';
      let orderClauses = [];

// Gestion de la date
if (plus_ra === 'recent') orderClauses.push('date_publication DESC');
else if (plus_ra === 'ancien') orderClauses.push('date_publication ASC');

// Gestion du prix
if (prix_cd === 'crois') orderClauses.push('prix ASC');
else if (prix_cd === 'decrois') orderClauses.push('prix DESC');

// Si on a des tris, on les ajoute à la requête
if (orderClauses.length > 0) {
    sql += ' ORDER BY ' + orderClauses.join(', ');
}

      const [rows] = await db.query(sql, params);
      res.json(rows);

  } catch (error) {
    logError(error, "function getAnnoncesByFilter dans le module:annoncesControllers.js");
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Publie une nouvelle annonce pour l'utilisateur authentifié, avec
 * gestion optionnelle d'une photo uploadée.
 * @function publierAnnonce
 * @async
 * @param {import('express').Request} req - Requête Express, `body` attendu : `{ titre, prix, descriptif, categorie }`, `files.photo` optionnel, `user` = utilisateur authentifié.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<import('express').Response>} Réponse HTTP :
 *   - 201 : Annonce publiée avec succès.
 *   - 400 : Champs obligatoires manquants, ou format de fichier non autorisé.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function publierAnnonce(req, res) {
   try {
      const { titre, prix, descriptif, categorie } = req.body;

      if (!titre || !prix || !descriptif || !categorie) {
            return res.status(400).json({ message: 'Champs obligatoires manquants' });
      }

      // ✅ On utilise l'utilisateur authentifié, pas une valeur envoyée par le client
      const userid = req.user.id;

      let image_nom = null;
      if (req.files && req.files.photo) {
            const photo = req.files.photo;
            const extension = photo.name.split('.').pop().toLowerCase();
            const extensions_autorisees = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

            if (!extensions_autorisees.includes(extension)) {
                return res.status(400).json({ message: 'Format de fichier non autorisé' });
            }

            image_nom = Date.now() + '_' + photo.name;
            const chemin_final = path.join(__dirname, '..', '..', 'frontend', 'uploads', image_nom);

            await photo.mv(chemin_final);
      }

      const [result] = await db.execute(
            'INSERT INTO annonces (titre, prix, descriptif, utilisateur_id, categorie_id) VALUES (?, ?, ?, ?, ?)',
            [titre, prix, descriptif, userid, categorie]
      );

      if (image_nom) {
            await db.execute(
                'INSERT INTO photos (photo_url, annonce_id) VALUES (?, ?)',
                [image_nom, result.insertId]
            );
      }

      return res.status(201).json({ message: 'Annonce publiée avec succès' });
   } catch (error) {
       logError(error, "FONCTION: publierAnnonce, MODULE: annoncesControllers.js");
       return res.status(500).json({ message: 'Erreur serveur' });
   }
}
