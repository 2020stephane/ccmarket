//===========================================================
//    FICHIER : annonces.js
//    PROJET  : ccmarket
//    DATE    : 01/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const express = require("express");
const router = express.Router();
const db = require("./db");

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

module.exports = router;
