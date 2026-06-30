/**
 * =======================================================
 *  @fileoverview  utilisateursControllers.js
 *  @project       ccmarket
 *  @description   Contrôleur de gestion de l'utilisateur.
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */
/**
 * =======================================================
 * IMPORTS
 * =======================================================
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';
import { setCookie, clearCookie } from '../tools/cookie.js';
import { connexionStandard } from './authControllers.js';
/**
 * =======================================================
 * VARIABLES
 * =======================================================
 */
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

/**
 * ========================================================
 *  @function     sInscrire
 *  @description  Inscription d'un nouvel utilisateur.
 *  @description  Valide les données reçues, vérifie l'unicité de l'email, hache le mot de passe.
 *  @description  Crée l'utilisateur en base de données, génère un cookie JWT et retourne le profil.
 *  @async
 * ========================================================
 *
 *  @param {import('express').Request} req - L'objet de requête Express.
 *  @param {Object} req.body          - Le corps de la requête.
 *  @param {string} req.body.prenom   - Le prénom de l'utilisateur.
 *  @param {string} req.body.nom      - Le nom de l'utilisateur.
 *  @param {string} req.body.email    - L'adresse email (unique).
 *  @param {string} req.body.password - Le mot de passe en clair à hacher.
 *  @param {import('express').Response} res - L'objet de réponse Express.
 *
 *  @returns {Promise<import('express').Response>} Une promesse résolue avec la réponse HTTP :
 * - 200: Succès, compte créé et utilisateur connecté (retourne l'id, prenom, nom).
 * - 400: Requête incorrecte (un ou plusieurs champs obligatoires sont manquants).
 * - 409: Conflit (l'adresse email est déjà utilisée).
 * - 500: Erreur interne du serveur (l'erreur est journalisée via logError).
 */
export async function sInscrire(req, res) {

   const { prenom, nom, email, password } = req.body;

      if (!prenom || !nom || !email || !password) {
         return res.status(400).json({ message: 'Tous les champs sont requis.' });
      }
      try {
         const [users] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
         const user = users[0];

         if (users.length > 0) {
            return res.status(409).json({ message: 'Mot de passe ou email déjà existant.' });
         }

         const hashedPassword = await bcrypt.hash(password, 10);

         const [result] = await db.query(
            'INSERT INTO utilisateurs (prenom, nom, email, motdepasse) VALUES (?, ?, ?, ?)',
            [prenom, nom, email, hashedPassword]
         );

         if (result.affectedRows > 0) {

            const payload = {
        id: result.insertId,
        email: email,
        nom: nom,
        prenom: prenom,
        administrateur: 0
    };
             const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.cookie('monToken', token, {
                httpOnly: true,  // inaccessible depuis le JS du navigateur (sécurité)
                secure: false,   // mettre true en production (HTTPS)
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours en millisecondes
            });
             const [temps] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
         const utilisateur = temps[0];       // 5. Réponse
                    return res.status(200).json({
                        success: true,
                        token,
                        user: {
                            id: utilisateur.utilisateur_id,
                            nom: utilisateur.nom,
                            prenom: utilisateur.prenom,
                            email: utilisateur.email,
                            date: utilisateur.date_inscription
                        }
                    });
        } else {
            return res.status(400).json({ error: "Erreur lors de l'inscription" });
        }
      } catch (error) {
          logError(error, "FONCTION: sInscrire, MODULE:utilisateursControllers.js");
         return res.status(500).json({ message: 'Erreur serveur.' });
      }
}
/**
 * =======================================================
 *  @function     supprimerUtilisateur
 *  @description  supprime le compte de l'utilisateur
 *  @async
 * =======================================================
  */
export async function supprimerUtilisateur(req, res) {
   try {
      const [result] = await db.execute(
         'DELETE FROM utilisateurs WHERE utilisateur_id = ?', [req.params.id]
      );
      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Annonce introuvable' });
      }
      res.json({ message: 'Annonce supprimée' });
   } catch (error) {
     logError(error, "FONCTION: supprimerUtilisateur, MODULE: annoncesControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
