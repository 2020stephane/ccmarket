//===========================================================
//    FICHIER : inscription.js
//    PROJET  : ccmarket
//    DATE    : 02/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db } from './db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

router.post('/inscription', async (req, res) => {
   const { prenom, nom, email, password } = req.body;
   if (!prenom || !nom || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
   }
   try {
      const [users] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
      if (users.length > 0) {
         return res.status(409).json({ message: 'Mot de passe ou email déjà existant.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.query(
         'INSERT INTO utilisateurs (prenom, nom, email, password) VALUES (?, ?, ?, ?)',
         [prenom, nom, email, hashedPassword]
      );
      console.log([result]);
      const token = jwt.sign(
         { id: result.insertId },
         JWT_SECRET,
         { expiresIn: '7d' }
      );
      
      res.cookie('monToken', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 7 * 24 * 60 * 60 * 1000 
      });
      return res.status(200).json({ message: 'Inscription réussie.' });

   } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur.' });
   }
});

export default router;
