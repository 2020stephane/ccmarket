//===========================================================
//    FICHIER : rechercher.js
//    PROJET  : ccmarket
//    DATE    : 10/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import express from 'express';
import { db } from './db.js';

const router = express.Router();
router.post('/recherche', async (req, res) => {
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
      if (prixmin && !isNaN(prixmin)) {
         sql += ' AND prix >= ?';
         params.push(Number(prixmin));
      }
      if (prixmax && !isNaN(prixmax)) {
         sql += ' AND prix <= ?';
         params.push(Number(prixmax));
      }
      if (plus_ra === 'recent') sql += ' ORDER BY date_publication DESC';
      else if (plus_ra === 'ancien') sql += ' ORDER BY date_publication ASC';
      else if (prix_cd === 'crois') sql += ' ORDER BY prix ASC';
      else if (prix_cd === 'decrois') sql += ' ORDER BY prix DESC';

      const [rows] = await db.query(sql, params);
      res.json(rows);
   } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur.' });
   }
});

module.exports = router;
