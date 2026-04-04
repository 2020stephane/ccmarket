//===========================================================
//    FICHIER : inscription.js
//    PROJET  : ccmarket
//    DATE    : 02/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');

router.post('/finscription', async (req, res) => {
   const { prenom, nom, email, password } = req.body;

   try {
      // Vérification si l'email existe déjà
      const [users] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);

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
      console.error('Erreur inscription :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
   }
});

module.exports = router;
