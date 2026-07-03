/**
 * @fileoverview Contrôleur de gestion de l'utilisateur
 * (inscription, suppression de compte).
 * @module utilisateursControllers
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-24
 * @author Stephane Brisse
 * @license MIT
 * @requires dotenv/config
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires ../tools/logger.js
 * @requires ../bdd/db.js
 * @requires ../tools/cookie.js
 * @requires ./authControllers.js
 */

import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';
import { setCookie, clearCookie } from '../tools/cookie.js';
import { connexionStandard } from './authControllers.js';

/**
 * Clé secrète utilisée pour signer les jetons JWT.
 * Repliée sur une valeur par défaut si non définie en environnement.
 * @type {string}
 * @const
 */
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_cle_en_prod';

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
 * Supprime le compte d'un utilisateur.
 * Seul le propriétaire du compte ou un administrateur peut effectuer
 * cette action.
 * @function supprimerUtilisateur
 * @async
 * @param {express.Request} req - Requête Express, `params.id` = identifiant de l'utilisateur à supprimer, `user` = utilisateur authentifié.
 * @param {express.Response} res - Réponse Express.
 * @returns {Promise<express.Response>} Réponse HTTP :
 *   - 200 : Suppression réussie.
 *   - 403 : Utilisateur non autorisé (ni propriétaire, ni administrateur).
 *   - 404 : Utilisateur introuvable.
 *   - 500 : Erreur interne du serveur (journalisée via logError).
 */
export async function supprimerUtilisateur(req, res) {
   try {
      const idCible = Number(req.params.id);
      const estProprietaire = req.user.id === idCible;
      const estAdmin = !!req.user.administrateur;

      if (!estProprietaire && !estAdmin) {
         return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer ce compte.' });
      }

      const [result] = await db.execute(
         'DELETE FROM utilisateurs WHERE utilisateur_id = ?', [idCible]
      );

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      res.json({ message: 'Utilisateur supprimé' });
   } catch (error) {
     logError(error, "FONCTION: supprimerUtilisateur, MODULE: utilisateursControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
