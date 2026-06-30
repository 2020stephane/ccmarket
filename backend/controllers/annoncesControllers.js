/**
 * =======================================================
 *  @fileoverview  annoncesControllers.js
 *  @project       ccmarket
 *  @description   Contrôleur de gestion des annonces
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */

/**
 * =======================================================
 * IMPORTS EXTERNES
 * =======================================================
 */
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import path from 'path';
import jwt from 'jsonwebtoken';

/**
 * =======================================================
 * IMPORTS INTERNES
 * =======================================================
 */
import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';

/**
 * =======================================================
 * VARIABLES
 * =======================================================
 */
const JWT_SECRET = process.env.JWT_SECRET;
const __dirname = fileURLToPath(new URL('.', import.meta.url));

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
      logError(error, "fonction putAnnonce dans le module:annoncesControllers.js");
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
      logError(error, "function patchAnnonce dans le module:annoncesControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
// ==================================================
// DELETE supprimer une annonce
// ==================================================
export async function supprimerAnnonce(req, res) {
   try {
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
// ==================================================
// derniers_ajouts
// ==================================================
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
// ==================================================
// mesannonces
// ==================================================
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
// ==================================================
// recherche
// ==================================================
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
// ==================================================
// publier
// ==================================================
export async function publierAnnonce(req, res) {
console.log("publierAnnonce appelée");
console.log("body:", req.body);
console.log("files:", req.files);
console.log("cookies:", req.cookies);
   try {
      const { titre, prix, descriptif, categorie, utilisateur_id } = req.body;
console.log("champs:", { titre, prix, descriptif, categorie, utilisateur_id });
      if (!titre || !prix || !descriptif || !categorie) {
            return res.status(400).json({ message: 'Champs obligatoires manquants' });
        }
      const token = req.cookies?.monToken;
      let userid = utilisateur_id;

        if (!userid) {
            return res.status(401).json({ message: 'Utilisateur non identifié' });
        }
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

      const [result]= await db.execute(
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
