//===========================================================
//    FICHIER : contacterControllers.js
//    PROJET  : ccmarket
//    DATE    : 21/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import 'dotenv/config';
import nodemailer from 'nodemailer';
import db from '../bdd/db.js';
import { logError } from '../tools/logger.js';

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
   },
   tls: {
      rejectUnauthorized: false
   }
});

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

      // Envoi de l'email de notification (ne bloque pas la réponse en cas d'échec)
      try {
         await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Nouveau message de contact: ${prenom} ${nom}`,
            text: `De: ${prenom} ${nom} (${email})\n\nMessage:\n${message}`
         });
      } catch (mailError) {
         logError(mailError, "FONCTION: contacterAdmin (envoi email), MODULE: contactControllers.js");
         // On ne renvoie pas d'erreur au client : le message est bien en base, seul le mail a échoué
      }

      res.status(201).json({ message: 'message envoyé', id: result.insertId });
   } catch (err) {
      logError(err, "FONCTION: contacterAdmin (insertion BDD), MODULE: contactControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
