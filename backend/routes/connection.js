//===========================================================
//    FICHIER : connection.js
//    PROJET  : ccmarket
//    DATE    : 01/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

router.post('/connection', async (req, res) => {
   const { email, password } = req.body;

   try {
      // 1. Chercher l'utilisateur par email
      const [users] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);

      // Email introuvable → retour page connexion
      if (users.length === 0) {
         return res.redirect('/connection.html');
      }

      const user = users[0];

      // 2. Comparer le mot de passe avec le hash en base
      // ⚠️ Correction : user.password (et non user.mot_de_passe)
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
         return res.status(401).redirect('/connection.html');
      }

      // 3. Générer le token JWT
      const token = jwt.sign(
         { id: user.userid, prenom: user.prenom, nom: user.nom, email: user.email },
         JWT_SECRET,
         { expiresIn: '7d' }
      );

      // 4. Stocker le token dans un cookie HTTP-only sécurisé
      res.cookie('monToken', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
      });

      // 5. Redirection vers l'accueil (un seul res.*)
      return res.redirect('/index.html');

   } catch (error) {
      console.error('Erreur connexion :', error);
      return res.status(500).send('Erreur lors de la tentative de connexion.');
   }
});

module.exports = router;
