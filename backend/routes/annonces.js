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

const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';
// GET /api/annonces/derniers-ajouts
router.get("/derniers-ajouts", async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT annonceid, titre, prix, date_publication, description, utilisateur_id, image_nom
            FROM annonces
            ORDER BY date_publication DESC
            LIMIT 12
        `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/mesannonces", async (req, res) => {
   const token = req.cookies.monToken;
   const decoded = jwt.verify(token, JWT_SECRET);
   const userid = decoded.id;
  try {
   
    const [rows] = await db.query(`
            SELECT * FROM annonces WHERE utilisateur_id = ?`,[userid]); 
            
       
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.post('/publierannonce', async (req, res) => {
   const { titre, prix, description, photo } = req.body;
   const token = req.cookies.monToken;
   const decoded = jwt.verify(token, JWT_SECRET);
   const userid = decoded.id;
   let image_nom = photo;

   if (req.files && req.files.photo) {
        const dossier_upload = "../frontend/uploads/";
        const extension = req.files.photo.name.split('.').pop();
        const nom_unique = Date.now() + "_" + req.files.photo.name;
        const chemin_final = dossier_upload + nom_unique;
        const extensions_autorisees = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (extensions_autorisees.includes(extension.toLowerCase())) {
            await req.files.photo.mv(chemin_final);
            image_nom = nom_unique;
        }
    }

   await db.query(
         'INSERT INTO annonces (titre, prix, description, utilisateur_id, image_nom) VALUES (?, ?, ?, ?, ?)',
         [titre, prix, description, userid, image_nom]
      );
});   
module.exports = router;
