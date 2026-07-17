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
 * @param {express.Request} req - Requête Express, `params.id` = identifiant de l'annonce, `body` = champs à mettre à jour, `user` = utilisateur authentifié.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Annonce mise à jour partiellement.
 *   - 400 : Aucun champ valide fourni.
 *   - 403 : Utilisateur non autorisé (ni propriétaire, ni administrateur).
 *   - 404 : Annonce introuvable.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function patchAnnonce(req, res) {
   const champs = req.body;
 console.log('champs = ', champs);
   const colonnesAutorisees = ['titre', 'descriptif', 'prix', 'categorie_id'];

   const entrees = Object.entries(champs).filter(([col]) =>
      colonnesAutorisees.includes(col)
   );

   if (entrees.length === 0) {
      return res.status(400).json({ message: 'Aucun champ valide fourni' });
   }

   try {
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
let image_nom = null;
      if (req.files && req.files.photo) {
            const photo = req.files.photo;
            const extension = photo.name.split('.').pop().toLowerCase();
            const extensions_autorisees = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

            if (!extensions_autorisees.includes(extension)) {
                return res.status(400).json({ message: 'Format de fichier non autorisé' });
            }

           image_nom = `${Date.now()}.${extension}`;
            const chemin_final = path.join(__dirname, '..', '..', 'frontend', 'uploads', image_nom);

            await photo.mv(chemin_final);
      }
       if (image_nom) {
            await db.execute(
        `UPDATE photos SET photo_url = ? WHERE annonce_id = ?`,
        [image_nom, req.params.id]
            );
      }
      res.json({ message: 'Annonce mise à jour' });
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
 * @param {express.Request} req - Requête Express, `params.id` = identifiant de l'annonce, `user` = utilisateur authentifié.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
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
 * Récupère les dernières annonces publiées, avec leurs photos associées.
 * @function getAjouts
 * @async
 * @param {express.Request} req - Requête Express.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Succès, retourne un tableau des dernières annonces (avec leurs photos).
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function getAjouts(req, res) {
     try {
          const { limite, categorie, keyword } = req.query;
          const limitNb = parseInt(limite, 10) || 50;
          const categorieNb = parseInt(categorie, 10) || 0;
          let sql = `
               SELECT
                    a.*,
                    c.nom AS nom_categorie,
                    GROUP_CONCAT(p.photo_url) AS photos
               FROM annonces a
               LEFT JOIN photos p ON a.annonce_id = p.annonce_id
               JOIN categories c ON a.categorie_id = c.categorie_id

          `;
          const conditions = [];
        const queryParams = [];

        // 1. Filtre par Catégorie
        if (categorieNb > 0) {
            conditions.push(`c.categorie_id = ?`);
            queryParams.push(categorieNb);
        }

        // 2. Filtre par Mot-clé sur le titre
        if (keyword && keyword.trim() !== "" && keyword !== "null") {
            conditions.push(`a.titre LIKE ?`);
            queryParams.push(`%${keyword.trim()}%`); // Cherche le mot-clé n'importe où dans le titre
        }

        // 3. Assemblage des conditions WHERE s'il y en a au moins une
        if (conditions.length > 0) {
            sql += ` WHERE ` + conditions.join(' AND ');
        }

          sql += `
               GROUP BY a.annonce_id
               ORDER BY a.date_publication DESC
               LIMIT ?
          `;

          queryParams.push(limitNb);

          const [rows] = await db.execute(sql, queryParams);

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

export async function getStatistiquesAnnonces(req, res) {
    try {
        const sql = `
            SELECT
                c.categorie_id,
                c.nom AS nom_categorie,
                COUNT(a.annonce_id) AS total_categorie
            FROM categories c
            LEFT JOIN annonces a ON c.categorie_id = a.categorie_id
            GROUP BY c.categorie_id WITH ROLLUP;
        `;

        const [rows] = await db.execute(sql);

        // La dernière ligne générée par WITH ROLLUP contient le total général
        const derniereLigne = rows[rows.length - 1];
        const totalGeneral = derniereLigne ? derniereLigne.total_categorie : 0;

        // On retire la ligne de ROLLUP pour garder un tableau propre des catégories
        const statsParCategorie = rows.slice(0, -1);

        return res.json({
            totalGeneral: totalGeneral,
            parCategorie: statsParCategorie
        });

    } catch (error) {
        logError(error, "function getStatistiquesAnnonces dans annoncesControllers.js");
        return res.status(500).json({ message: "Erreur serveur" });
    }
}

export async function getStatistiquesAdmin(req, res) {
console.log('getStatistiquesAdmin');
  try {
    // Compteurs globaux
    const [[compteurs]] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM utilisateurs) AS nb_utilisateurs,
        (SELECT COUNT(*) FROM annonces) AS nb_annonces,
        (SELECT COUNT(*) FROM messages) AS nb_messages,
        (SELECT COUNT(*) FROM photos) AS nb_photos,
        (SELECT COUNT(*) FROM categories) AS nb_categories,
        (SELECT COUNT(*) FROM contacts) AS nb_contacts
    `);

    // Annonces par catégorie
    const [parCategorie] = await db.execute(`
      SELECT c.nom AS categorie, COUNT(a.annonce_id) AS nb_annonces
      FROM annonces a
      JOIN categories c ON a.categorie_id = c.categorie_id
      GROUP BY c.nom
      ORDER BY nb_annonces DESC
    `);

    // Top 10 utilisateurs les plus actifs (par nb d'annonces)
    const [topUtilisateurs] = await db.execute(`
      SELECT u.utilisateur_id, u.nom, u.prenom, COUNT(a.annonce_id) AS nb_annonces
      FROM utilisateurs u
      JOIN annonces a ON u.utilisateur_id = a.utilisateur_id
      GROUP BY u.utilisateur_id
      ORDER BY nb_annonces DESC
      LIMIT 10
    `);

    // Inscriptions par mois
    const [inscriptionsParMois] = await db.execute(`
      SELECT DATE_FORMAT(date_inscription, '%Y-%m') AS mois, COUNT(*) AS nb_inscriptions
      FROM utilisateurs
      GROUP BY mois
      ORDER BY mois
    `);

    // Annonces par mois
    const [annoncesParMois] = await db.execute(`
      SELECT DATE_FORMAT(date_publication, '%Y-%m') AS mois, COUNT(*) AS nb_annonces
      FROM annonces
      GROUP BY mois
      ORDER BY mois
    `);

    // Prix moyen / min / max
    const [[prixStats]] = await db.execute(`
      SELECT AVG(prix) AS prix_moyen, MIN(prix) AS prix_min, MAX(prix) AS prix_max
      FROM annonces
    `);

    // Top 10 annonces les plus contactées
    const [annoncesPopulaires] = await db.execute(`
      SELECT a.annonce_id, a.titre, COUNT(m.message_id) AS nb_messages
      FROM annonces a
      JOIN messages m ON a.annonce_id = m.annonce_id
      GROUP BY a.annonce_id
      ORDER BY nb_messages DESC
      LIMIT 10
    `);

    res.status(200).json({
      compteurs,
      parCategorie,
      topUtilisateurs,
      inscriptionsParMois,
      annoncesParMois,
      prixStats,
      annoncesPopulaires
    });

  } catch (error) {
    logError(error, "FONCTION: getStats, MODULE: statsControllers.js");
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

/**
 * Récupère toutes les annonces publiées par un utilisateur donné,
 * enrichies de leurs photos et du nom de leur catégorie.
 * @function getAnnoncesByUser
 * @async
 * @param {express.Request} req - Requête Express, `params.id` = identifiant de l'utilisateur.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
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
 * @param {express.Request} req - Requête Express, `body` attendu : `{ categorie, prixmin, prixmax, plus_ra, prix_cd }`.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
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
 * @param {express.Request} req - Requête Express, `body` attendu : `{ titre, prix, descriptif, categorie }`, `files.photo` optionnel, `user` = utilisateur authentifié.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
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
const MIME_VERS_EXTENSION = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
};
      let image_nom = null;
      if (req.files && req.files.photo) {
            const photo = req.files.photo;

            const extension = MIME_VERS_EXTENSION[photo.mimetype];

    if (!extension) {
        return res.status(400).json({ message: 'Format de fichier non autorisé' });
    }

    image_nom = Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + extension;
            const chemin_final = path.join(__dirname, '..', '..', 'frontend', 'uploads', 'photos',image_nom);

            await photo.mv(chemin_final);
      }

      const [result] = await db.execute(
            'INSERT INTO annonces (titre, prix, descriptif, utilisateur_id, adresse_id, categorie_id) VALUES (?, ?, ?, ?, ?, ?)',
            [titre, prix, descriptif, userid, 1, categorie]
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
export async function getCategories(req, res) {
     try {
          const [rows] = await db.execute( 'SELECT * FROM categories' );
          res.json(rows);
     }catch (error) {
          logError(error, "FONCTION: getCategories, MODULE: annoncesControllers.js");
          return res.status(500).json({ message: 'Erreur serveur' });
     }
}
