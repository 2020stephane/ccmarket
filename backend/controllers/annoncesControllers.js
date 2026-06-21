//===========================================================
//    FICHIER : annonces.js
//    PROJET  : ccmarket
//    DATE    : 16/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import db from '../bdd/db.js';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
// ==================================================
// GET toutes les annonces
// ==================================================
export async function getAnnonces(req, res) {
   try {
      const [annonces] = await db.execute(
         'SELECT * FROM annonces ORDER BY date_publication DESC'
      );
      res.json(annonces);
   } catch (err) {
      console.error(err);
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
      const [photosDeLAnnonce] = await db.execute(
         'SELECT * FROM photos WHERE annonce_id = ?', [req.params.id]
      );
      annonce.photos = photosDeLAnnonce;
      res.json(annonce);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
// ==================================================
// POST créer une annonce
// ==================================================
export async function createAnnonce(req, res) {
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
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
// ==================================================
//  PUT modifier une annonce
// ==================================================
export async function updateAnnonce(req, res) {
   const { titre, descriptif, prix, categorie_id } = req.body;

   if (!titre || !descriptif || !prix || !categorie_id) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
   }

   try {
      const [result] = await db.execute(
         'UPDATE annonces SET titre = ?, descriptif = ?, prix = ?, categorie_id = ? WHERE annonce_id = ?',
         [titre, descriptif, prix, categorie_id ?? null, req.params.id]
      );
      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }
      res.json({ message: 'Annonce mise à jour' });
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
// ==================================================
// PATCH modifier partiellement une annonce
// ==================================================
export async function patchAnnonce(req, res) {
   const champs = req.body;
   const colonnesAutorisees = ['titre', 'description', 'prix', 'categorie'];

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
         `UPDATE annonces SET ${setClause} WHERE id = ?`,
         [...valeurs, req.params.id]
      );
      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }
      res.json({ message: 'Annonce mise à jour partiellement' });
   } catch (err) {
      console.error(err);
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
   } catch (err) {
      console.error(err);
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
    console.log(error.message);
    console.log(error.name);
    console.log(error.stack);
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

        // On retourne l'annonce en lui injectant son tableau de photos
        return {
          ...fiche,
          photos: photosDeLAnnonce
        };
      })
    );

    // 3. Renvoyer le résultat complet au frontend
    res.json(fichesAvecPhotos);
  } catch (error) {
    console.log(error.message);
    console.log(error.name);
    console.log(error.stack);
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
    console.log(error.message);
    console.log(error.name);
    console.log(error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
// ==================================================
// publier
// ==================================================
export async function publierAnnonce(req, res) {
   try {
      const { titre, prix, descriptif, categorie, photo } = req.body;
      const token = req.cookies.monToken;
      const decoded = jwt.verify(token, JWT_SECRET);
      const userid = decoded.id;
      let image_nom = photo;
      if (req.files && req.files.photo) {

           const dossier_upload = path.join(__dirname, '..', '..', 'frontend', 'uploads');
           const extension = req.files.photo.name.split('.').pop();
           const nom_unique = Date.now() + "_" + req.files.photo.name;
           const chemin_final = path.join(dossier_upload, nom_unique);
           const extensions_autorisees = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
           console.log("url= ",chemin_final);
           if (extensions_autorisees.includes(extension.toLowerCase())) {
               await req.files.photo.mv(chemin_final);
               image_nom = nom_unique;
           }
       }

      const [result]= await db.execute(
            'INSERT INTO annonces (titre, prix, descriptif, utilisateur_id, categorie_id) VALUES (?, ?, ?, ?, ?)',
            [titre, prix, descriptif, userid, categorie]
         );
      await db.execute(
            'INSERT INTO photos (photo_url, annonce_id) VALUES (?, ?)',
            [image_nom, result.insertId]
         );
      return res.redirect('/mesannonces.html');
       } catch (error) {
         console.error(error);
       }
}
