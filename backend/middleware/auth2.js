//===========================================================
//    FICHIER : auth.js
//    PROJET  : ccmarket
//    DATE    : 28/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

const verifierToken = (req, res, next) => {
  try {
    const token = req.cookies.monToken;
    if (!token) return res.status(401).json({ message: "Non authentifié" });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token invalide" });
  }
};
module.exports =  verifierToken ;
