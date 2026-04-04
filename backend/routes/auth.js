//===========================================================
//    FICHIER : auth.js
//    PROJET  : ccmarket
//    DATE    : 04/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
//===========================================================
//    FICHIER : auth.js
//===========================================================
require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

router.get('/connect', (req, res) => {
   const token = req.cookies.monToken;
   if (!token) return res.status(401).json({ connecte: false });

   try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ connecte: true, prenom: decoded.prenom, nom: decoded.nom });
   } catch (e) {
      res.status(401).json({ connecte: false });
   }
});

router.post('/deconnect', (req, res) => {
   res.clearCookie('monToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
   });
   res.json({ deconnecte: true });
});

module.exports = router;
