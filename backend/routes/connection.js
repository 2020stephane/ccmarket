//===========================================================
//    FICHIER : connection.js
//    PROJET  : ccmarket
//    DATE    : 01/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { setCookie, clearCookie  } from '../tools/cookie.js';
import { db } from './db.js';
import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
 
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

router.post('/connection', async (req, res) => {
   const { email, password } = req.body;

   try {
      const [users] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
      const user = users[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
         return res.status(409).json({ message: 'Mot de passe ou email invalide' });
      }
      setCookie(res, user, JWT_SECRET);
      return res.status(200).json({ message: 'Connection réussie.' });
   } catch (error) {
      console.error('Erreur connexion :', error);
      return res.status(500).send('Erreur lors de la tentative de connexion.');
   }
});

router.post('/deconnection', (req, res) => {
   clearCookie(res);
   res.json({ deconnecte: true });
});
export default router;
