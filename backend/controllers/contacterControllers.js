/**
 * @fileoverview Contrôleur de contact : enregistre les messages
 * envoyés à l'administrateur et lui transmet une notification par email.
 * @module contacterControllers
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-21
 * @author Stephane Brisse
 * @license MIT
 * @requires dotenv/config
 * @requires nodemailer
 * @requires ../bdd/db.js
 * @requires ../tools/logger.js
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';
import db from '../bdd/db.js';
import { logError } from '../tools/logger.js';

/**
 * Transporteur Nodemailer configuré pour envoyer les notifications
 * de contact via un compte Gmail.
 * @type {import('nodemailer').Transporter}
 * @const
 */
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

/**
 * Enregistre un message de contact en base de données et notifie
 * l'administrateur par email. Si l'envoi de l'email échoue, l'erreur
 * est journalisée mais la réponse au client reste un succès (le
 * message est bien enregistré en base).
 * @function contacterAdmin
 * @async
 * @param {import('express').Request} req - Requête Express, `body` attendu : `{ prenom, nom, email, message }`.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<import('express').Response>} Réponse HTTP :
 *   - 201 : Message envoyé, retourne son identifiant.
 *   - 400 : Champs obligatoires manquants.
 *   - 500 : Erreur interne du serveur lors de l'insertion en base (journalisée via logError).
 */
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
