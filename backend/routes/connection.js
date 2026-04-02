//===========================================================
//    FICHIER : connection.js
//    PROJET  : ccmarket
//    DATE    : 01/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');

router.post('/connect', async (req, res) => {
   const { email, password } = req.body;

   try {
      // 1. Chercher l'utilisateur par email
      const [users] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);

      if (users.length === 0) {
         return res.status(401).send("Email incorrect.");
      }

      const user = users[0];

      const match = await bcrypt.compare(password, user.mot_de_passe);
      if (match) {
         // Ici, tu pourrais créer une session ou un token JWT
         res.send(`Bienvenue ${user.nom} ! Connexion réussie.`);
      } else {
         res.status(401).send("mot de passe incorrect.");
      }

   } catch (error) {
      console.error(error);
      res.status(500).send("Erreur lors de la tentative de connexion.");
   }
});

module.exports = router;
