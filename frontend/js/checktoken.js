//===========================================================
//    FICHIER : checktoken.js
//    PROJET  : ccmarket
//    DATE    : 02/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
   const token = req.cookies.token;
   if (!token) return res.status(401).redirect('/connection.html');
   try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
   } catch {
      res.status(401).redirect('/connection.html');
   }
}
