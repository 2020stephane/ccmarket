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
 * IMPORTS EXTERNES
 * =======================================================
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
/**
 * =======================================================
 * IMPORTS INTERNES
 * =======================================================
 */
import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';
import { setCookie, clearCookie } from '../tools/cookie.js';
/**
 * =======================================================
 * VARIABLES
 * =======================================================
 */
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

/**
 * =======================================================
 *  @function     seConnecter
 *  @description  Fonction de connexion de l'utilisateur.
 *  @async
 * =======================================================
 *
 *  @param {import('express').Request} req - L'objet de requête Express.
 *  @param {Object} req.body - Le corps de la requête.
 *  @param {string} req.body.email - L'adresse email de l'utilisateur.
 *  @param {string} req.body.motdepasse - Le mot de passe en clair.
 *  @param {import('express').Response} res - L'objet de réponse Express.
 *
 *  @returns {Promise<import('express').Response>} Réponse HTTP :
 *    - 200 : Succès, retourne les données de session de l'utilisateur.
 *    - 409 : Conflit / Identifiants invalides (email ou mot de passe incorrect).
 *    - 500 : Erreur interne du serveur (l'erreur est journalisée via logError).
 *
 * =======================================================
 */

export async function seConnecter(req, res) {

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
            nom: user.nom,
            admin: user.administrateur
         });
   } catch (error) {
         logError(error, "function seConnecter dans le module:utilisateursControllers.js");
         return res.status(500).json('Erreur lors de la tentative de connexion.');
   }
}
/**
 * =======================================================
 *  @function     seDeconnecter
 *  @description  Contrôleur de deconnection de l'utilisateur.
 *  @async
 * =======================================================
 *
 *  @param {import('express').Request} req - L'objet de requête Express.
 *  @param {Object} req.body               - Le corps de la requête.
 *  @param {import('express').Response} res - L'objet de réponse Express.
 *
 *  @returns {Promise<import('express').Response>} Réponse HTTP :
 * ========================================================
 */
export async function seDeconnecter(req, res){
     clearCookie(res);
     res.json({ connection: false });
}
/**
 * ========================================================
 *  @function     sInscrire
 *  @description  Contrôleur d'inscription d'un nouvel utilisateur.
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

         const nouvelUtilisateur = { id: result.insertId, prenom:prenom, nom:nom, email:email };
         setCookie(res, nouvelUtilisateur, JWT_SECRET);
         return res.status(200).json({
            id: nouvelUtilisateur.id,
            prenom: nouvelUtilisateur.prenom,
            nom: nouvelUtilisateur.nom });
      } catch (error) {
          logError(error, "function sInscrire dans le module:utilisateursControllers.js");
         return res.status(500).json({ message: 'Erreur serveur.' });
      }
}
