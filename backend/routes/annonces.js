//===========================================================
//    FICHIER : annonces.js
//    PROJET  : ccmarket
//    DATE    : 01/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const express = require("express");
const router = express.Router();
const db = require("./db");
const jwt = require('jsonwebtoken');
const path = require('path');
const verifierToken = require('../middleware/auth2');
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';
// ==================================================
// derniers_ajouts
// ==================================================
router.get("/derniers_ajouts", async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT annonceid, titre, prix, date_publication, description, utilisateur_id, image_nom
            FROM annonces
            ORDER BY date_publication DESC
            LIMIT 12
        `);
    res.json(rows);
  } catch (error) {
    console.log(error.message);
    console.log(error.name);
    console.log(error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
// ==================================================
// mesannonces
// ==================================================

router.get("/mesannonces", verifierToken, async (req, res) => {
   
  try {
   const userid = req.user.id;
   const [rows] = await db.query(`SELECT * FROM annonces WHERE utilisateur_id = ?`,[userid]); 
   res.json(rows);
  } catch (error) {
    console.log(error.message);
    console.log(error.name);
    console.log(error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.post('/publierannonce', async (req, res) => {
   try {
   const { titre, prix, description, photo } = req.body;
   const token = req.cookies.monToken;
   const decoded = jwt.verify(token, JWT_SECRET);
   const userid = decoded.id;
   let image_nom = photo;
   console.log(`test log ${image_nom}`);
   if (req.files && req.files.photo) {
      
        const dossier_upload = path.join(__dirname, '../../frontend/uploads/');
        const extension = req.files.photo.name.split('.').pop();
        const nom_unique = Date.now() + "_" + req.files.photo.name;
        const chemin_final = dossier_upload + nom_unique;
        const extensions_autorisees = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        console.log(`test log ok ${chemin_final}`);

        if (extensions_autorisees.includes(extension.toLowerCase())) {
            await req.files.photo.mv(chemin_final);
            image_nom = nom_unique;
        }
    }

   await db.query(
         'INSERT INTO annonces (titre, prix, description, utilisateur_id, image_nom) VALUES (?, ?, ?, ?, ?)',
         [titre, prix, description, userid, image_nom]
      );
   return res.status(201).json({ message: "Annonce publiée avec succès !" });
    } catch (error) {
      console.error(error); 
    }
}); 

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
   } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur.' });
   }
});  
module.exports = router;
