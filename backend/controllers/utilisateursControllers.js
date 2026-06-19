//===========================================================
//    FICHIER : utilisateursControllers.js
//    PROJET  : ccmarket
//    DATE    : 18/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import db from '../bdd/db.js';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { setCookie, clearCookie } from '../tools/cookie.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

// ==================================================
// Function: seConnecter
// input:    email, motdepasse
// output:   id, prenom, nom
// ==================================================
export const seConnecter = async (req, res) => {

     const { email, motdepasse } = req.body;

     try {
          const [users] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
          const user = users[0];
          if (!user) {
          return res.status(409).json({ message: 'Mot de passe ou email invalide' });
          }
          const match = await bcrypt.compare(motdepasse, user.motdepasse);
          if (!match) {
          return res.status(409).json({ message: 'Mot de passe ou email invalide' });
          }
          setCookie(res, user, JWT_SECRET);
          return res.status(200).json({
          id: user.utilisateur_id,
          prenom: user.prenom,
          nom: user.nom
          });
     } catch (error) {
          console.error('Erreur connexion :', error);
          return res.status(500).json('Erreur lors de la tentative de connexion.');
     }
}
// ==================================================
// seDeconnecter
// ==================================================
export const seDeconnecter = (req, res) => {
     clearCookie(res);
     res.json({ connection: false });
}
// ==================================================
// s'inscrire
// ==================================================
export const sInscrire = async (req, res) => {
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
              'INSERT INTO utilisateurs (prenom, nom, email, motdepasse) VALUES (?, ?, ?, ?)',
              [prenom, nom, email, hashedPassword]
           );
           setCookie(res, user, JWT_SECRET);
           return res.status(200).json({ message: 'Inscription réussie.' });

   } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur.' });
   }
}
