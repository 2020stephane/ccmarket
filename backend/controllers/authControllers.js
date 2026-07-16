/**
 * @fileoverview Contrôleur d'authentification : connexion standard
 * (email/mot de passe), connexion Google (OAuth2), déconnexion et
 * vérification du statut de session. Génère et vérifie les jetons JWT.
 * @module authControllers
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-25
 * @author Stephane Brisse
 * @license MIT
 * @requires express
 * @requires google-auth-library
 * @requires bcrypt
 * @requires dotenv/config
 * @requires jsonwebtoken
 * @requires ../bdd/db.js
 * @requires ../tools/logger.js
 */

import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import db from '../bdd/db.js';
import { logError } from "../tools/logger.js";

/**
 * Routeur Express local (non utilisé par les routes déclarées
 * dans `routes/auth.js`, conservé ici pour compatibilité).
 * @type {express.Router}
 * @const
 */
const router = express.Router();

/**
 * Identifiant client OAuth2 fourni par Google.
 * @type {string}
 * @const
 */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

/**
 * Client OAuth2 Google utilisé pour vérifier les jetons d'identité.
 * @type {OAuth2Client}
 * @const
 */
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Génère un JWT signé pour un utilisateur authentifié.
 * @param {Object} utilisateur - doit contenir id, email, nom, prenom, role
 * @returns {string} token JWT
 */
function genererToken(utilisateur, expiresIn = '7d') {
    const { id, email, nom, prenom, role } = utilisateur;

    if (!id || !email || !role) {
        throw new Error('genererToken: champs obligatoires manquants (id, email, role)');
    }

    const payload = { id, email, nom, prenom, role };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}
/**
 * Inscrit un nouvel utilisateur.
 * Valide les données reçues, vérifie l'unicité de l'email, hache le
 * mot de passe, crée l'utilisateur en base de données, génère un
 * cookie JWT et retourne son profil.
 * @function sInscrire
 * @async
 * @param {express.Request} req - Requête Express, `body` attendu : `{ prenom, nom, email, password }`.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Inscription réussie, retourne le token et le profil créé.
 *   - 400 : Champs manquants ou erreur lors de l'insertion.
 *   - 409 : Email déjà utilisé par un compte existant.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function sInscrire(req, res) {
     const { prenom, nom, email, password } = req.body;
     if (!prenom || !nom || !email || !password) {
          return res.status(400).json({ message: 'Tous les champs sont requis.' });
     }

     const emailNormalise = email.trim().toLowerCase();

     try {
          const [users] = await db.query('SELECT utilisateur_id FROM utilisateurs WHERE email = ?', [emailNormalise]);
          if (users.length > 0) {
               return res.status(409).json({ message: 'Un compte existe déjà avec cet email.' });
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const [result] = await db.query(
               `INSERT INTO utilisateurs (prenom, nom, email, motdepasse, role_id)
                VALUES (?, ?, ?, ?, 3)`, // 3 = invite (rôle par défaut)
               [prenom, nom, emailNormalise, hashedPassword]
          );

          const token = genererToken({
               id: result.insertId,
               email: emailNormalise,
               nom,
               prenom,
               role: 'invite'
          });
          res.cookie('monToken', token, {
               httpOnly: true,
               secure: false, // mettre true en production (HTTPS)
               sameSite: 'lax',
               maxAge: 7 * 24 * 60 * 60 * 1000
          });

          return res.status(200).json({
               success: true,
               user: {
                    id: result.insertId,
                    nom,
                    prenom,
                    email: emailNormalise,
                    avatar_url: null,
                    date: new Date(),
                    role: 'invite'
               }
          });

     } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
               return res.status(409).json({ message: 'Un compte existe déjà avec cet email.' });
          }
          logError(error, "FONCTION: sInscrire, MODULE:utilisateursControllers.js");
          return res.status(500).json({ message: 'Erreur serveur.' });
     }
}

/**
 * Connecte un utilisateur via son compte Google.
 * Vérifie le jeton d'identité auprès de Google, crée automatiquement
 * l'utilisateur en base s'il n'existe pas encore, puis génère un JWT
 * local stocké en cookie.
 * @function connexionGoogle
 * @async
 * @param {express.Request} req - Requête Express, `body` attendu : `{ token }` (jeton d'identité Google).
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Connexion réussie, retourne le token local et le profil utilisateur.
 *   - 400 : Jeton Google manquant.
 *   - 401 : Jeton Google invalide ou expiré (journalisé via logError).
 */
// uri1 http://localhost
// uri2 http://127.0.0.1:3000
// uri3 http://localhost:3000
// uri1 http://localhost:3000/api/auth/google/callback

export async function connexionGoogle(req, res) {
    const { token: googleToken } = req.body;

    if (!googleToken) {
        return res.status(400).json({ success: false, message: 'Token manquant.' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture } = payload;
        const emailNormalise = email.trim().toLowerCase();

        const [rows] = await db.query(
            `SELECT u.*, r.nom AS role_nom
             FROM utilisateurs u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.email = ?`,
            [emailNormalise]
        );

        let utilisateur;

        if (rows.length === 0) {
            // Nouvel utilisateur → inscription automatique via Google, rôle "invite" (role_id = 3) par défaut
            const [result] = await db.query(
                `INSERT INTO utilisateurs (nom, prenom, email, motdepasse, methode_auth, avatar_url, role_id)
                 VALUES (?, ?, ?, NULL, 'google', ?, 3)`,
                [family_name, given_name, emailNormalise, picture]
            );
            utilisateur = {
                utilisateur_id: result.insertId,
                nom: family_name,
                prenom: given_name,
                email: emailNormalise,
                avatar_url: picture,
                date_inscription: new Date(),
                role_nom: 'invite'
            };
        } else {
            utilisateur = rows[0];

            if (utilisateur.methode_auth === 'local') {
                return res.status(409).json({
                    success: false,
                    message: 'Un compte existe déjà avec cet email. Connectez-vous avec votre mot de passe.'
                });
            }
        }

        const token = genererToken({
            id: utilisateur.utilisateur_id,
            email: utilisateur.email,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            role: utilisateur.role_nom
        });

        res.cookie('monToken', token, {
            httpOnly: true,
            secure: false, // mettre true en production (HTTPS)
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            user: {
                id: utilisateur.utilisateur_id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                date: utilisateur.date_inscription,
                avatar_url: utilisateur.avatar_url,
                role: utilisateur.role_nom
            }
        });

    } catch (error) {
        logError(error, "FONCTION: connexionGoogle, MODULE:utilisateursControllers.js");
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
}

/**
 * Connecte un utilisateur via son email et son mot de passe.
 * Vérifie les identifiants en base et génère un JWT local stocké
 * en cookie en cas de succès.
 * @function connexionStandard
 * @async
 * @param {express.Request} req - Requête Express, `body` attendu : `{ email, password }`.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Connexion réussie, retourne le token et le profil utilisateur.
 *   - 400 : Email ou mot de passe manquant.
 *   - 401 : Identifiants incorrects.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function connexionStandard(req, res) {
     const { email, password } = req.body;
     if (!email || !password) {
          return res.status(400).json({
               success: false,
               message: 'Email et mot de passe requis.'
          });
     }
     try {
          const [rows] = await db.query(
               `SELECT u.*, r.nom AS role_nom
                FROM utilisateurs u
                JOIN roles r ON u.role_id = r.role_id
                WHERE u.email = ?`,
               [email.trim().toLowerCase()]
          );
          if (rows.length === 0) {
               return res.status(401).json({
                    success: false,
                    message: 'Identifiants incorrects.'
               });
          }
          const utilisateur = rows[0];

          if (utilisateur.methode_auth === 'google' || !utilisateur.motdepasse) {
               return res.status(401).json({
                    success: false,
                    message: 'Ce compte utilise la connexion Google. Veuillez vous connecter avec ce mode.'
               });
          }

          const motDePasseValide = await bcrypt.compare(password, utilisateur.motdepasse);
          if (!motDePasseValide) {
               return res.status(401).json({
                    success: false,
                    message: 'Identifiants incorrects.'
               });
          }

          const token = genererToken({
               id: utilisateur.utilisateur_id,
               email: utilisateur.email,
               nom: utilisateur.nom,
               prenom: utilisateur.prenom,
               role: utilisateur.role_nom
          });

          res.cookie('monToken', token, {
               httpOnly: true,
               secure: false, // mettre true en production (HTTPS)
               sameSite: 'lax',
               maxAge: 7 * 24 * 60 * 60 * 1000
          });

          return res.status(200).json({
               success: true,
               user: {
                    id: utilisateur.utilisateur_id,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    email: utilisateur.email,
                    date: utilisateur.date_inscription,
                    avatar_url: utilisateur.avatar_url,
                    role: utilisateur.role_nom
               }
          });

     } catch (error) {
          logError(error, "fonction: connexionStandard, MODULE: authControllers.js");
          return res.status(500).json({
               success: false,
               message: 'Erreur serveur.'
          });
     }
}

/**
 * Déconnecte l'utilisateur, quel que soit son mode de connexion
 * (standard ou Google), en supprimant le cookie de session.
 * @function deconnexion
 * @async
 * @route POST /auth/logout
 * @access Public
 * @param {express.Request} req - Requête Express.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Déconnexion réussie.
 */
export async function deconnexion(req, res) {
     res.clearCookie('monToken');
     return res.status(200).json({ success: true, message: 'Déconnecté avec succès.' });
}

/**
 * Renvoie le statut de connexion de l'utilisateur courant, en
 * décodant le JWT présent dans le cookie `monToken`.
 * @function status
 * @async
 * @param {express.Request} req - Requête Express, cookie `monToken` attendu.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP (toujours 200) :
 *   - `{ connection: false }` si aucun token ou token invalide (erreur journalisée via logError).
 *   - `{ connection: true, id, prenom, nom }` si le token est valide.
 */
export async function status(req, res) {
   const token = req.cookies.monToken;
   if (!token){
       return res.json({ connection: false, message: "pas de token" });
   }
   try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({
            connection: true,
            id: decoded.id,
            prenom: decoded.prenom,
            nom: decoded.nom
        });
   } catch (error) {
        logError(error, "FONCTION: status, MODULE: authControllers.js");
        res.json({ connection: false });
   }
}

export default router;
