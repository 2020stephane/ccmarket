//===========================================================
//    FICHIER : contacterControllers.js
//    PROJET  : ccmarket
//    DATE    : 21/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import db from '../bdd/db.js';

export async function contacterAdmin(req, res) {
   const { prenom, nom, email, message } = req.body;

   if (!prenom || !nom || !email || !message) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
   }

   try {
      const [result] = await db.execute(
         'INSERT INTO contacts (prenom, nom, email, message) VALUES (?, ?, ?, ?)',
         [prenom, nom, email, message]
      );
      res.status(201).json({ message: 'message envoyé', id: result.insertId });
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
