//===========================================================
//    FICHIER : annonces.js
//    PROJET  : ccmarket
//    DATE    : 16/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { db } from '../bdd/db.js';
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
         'SELECT * FROM annonces WHERE annonce_id = ?',
         [req.params.id]
      );
      if (rows.length === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }
      res.json(rows[0]);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
// ==================================================
// POST créer une annonce
// ==================================================
export async function createAnnonce(req, res) {
   const { titre, descriptif, prix, categorie } = req.body;

   if (!titre || !descriptif || !prix || !categorie) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
   }

   try {
      const [result] = await db.execute(
         'INSERT INTO annonces (titre, descriptif, prix, categorie, utilisateur_id, date_publication) VALUES (?, ?, ?, ?, ?)',
         [titre, description, prix, categorie ?? null]
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
   const { titre, description, prix, categorie } = req.body;

   if (!titre || !description || !prix) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
   }

   try {
      const [result] = await db.execute(
         'UPDATE annonces SET titre = ?, description = ?, prix = ?, categorie = ? WHERE id = ?',
         [titre, description, prix, categorie ?? null, req.params.id]
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
