//===========================================================
//    FICHIER : inscription.js
//    PROJET  : ccmarket
//    DATE    : 02/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

router.post('/finscription', async (req, res) => {
   const { prenom, nom, email, password } = req.body;

   try {
      const [users] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
      if (users.length > 0) {
         return res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
         'INSERT INTO utilisateurs (prenom, nom, email, password) VALUES (?, ?, ?, ?)',
         [prenom, nom, email, hashedPassword]
      );

      const [user1] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
      const user = user1[0];
      const token = jwt.sign(
         { id: user.userid, prenom: user.prenom, nom: user.nom, email: user.email },
         JWT_SECRET,
         { expiresIn: '7d' }
      );
      
      res.cookie('monToken', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 7 * 24 * 60 * 60 * 1000 
      });
      return res.redirect('/index.html');

   } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur.' });
   }
});

module.exports = router;
