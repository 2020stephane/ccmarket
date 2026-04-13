//===========================================================
//    FICHIER : rechercher.js
//    PROJET  : ccmarket
//    DATE    : 10/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const express = require('express');
const router = express.Router();
const db = require('./db');
router.post('/recherche', async (req, res) => {
   const { prixmin, prixmax, plus_ra, prix_cd } = req.body;

   try {
      // Vérification si l'email existe déjà
      const [users] = await db.query('SELECT * FROM annonces WHERE email = ?', [email]);

      if (users.length > 0) {
         return res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
      }

      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertion du nouvel utilisateur
      await db.query(
         'INSERT INTO utilisateurs (prenom, nom, email, password) VALUES (?, ?, ?, ?)',
         [prenom, nom, email, hashedPassword]
      );

      return res.redirect('/index.html');

   } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur.' });
   }
});

module.exports = router;
