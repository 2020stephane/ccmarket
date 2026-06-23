//===========================================================
//    FICHIER : cookie.js
//    PROJET  : ccmarket
//    DATE    : 11/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import jwt from 'jsonwebtoken';

export function setCookie(res, user, JWT_SECRET) {
   const token = jwt.sign(
            { id: user.utilisateur_id, prenom: user.prenom, nom: user.nom, email: user.email },
            JWT_SECRET,
            { expiresIn: '4h' }
         );
         res.cookie('monToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
         });
}
export function clearCookie(res) {
   res.clearCookie('monToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
   });
}
