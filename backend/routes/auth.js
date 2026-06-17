//===========================================================
//    FICHIER : auth.js
//    PROJET  : ccmarket
//    DATE    : 04/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

router.get('/status', (req, res) => {
   const token = req.cookies.monToken;
   if (!token){

       return res.json({ connection: false, message: "pas de token" });
   }
   try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ connection: true, prenom: decoded.prenom, nom: decoded.nom });
   } catch (e) {
      res.status(401).json({ connection: false });
   }
});
export default router;
