/**
 * @fileoverview Outils de gestion du cookie d'authentification JWT
 * (`monToken`) : création et suppression.
 * @module cookie
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-11
 * @author Stephane Brisse
 * @license MIT
 * @requires jsonwebtoken
 */

import jwt from 'jsonwebtoken';

/**
 * Génère un JWT signé pour un utilisateur donné et le dépose dans
 * un cookie `monToken` sécurisé (`httpOnly`, `sameSite: strict`,
 * `secure` en production).
 * @function setCookie
 * @param {express.Response} res - Réponse Express sur laquelle poser le cookie.
 * @param {Object} user - Utilisateur pour lequel générer le token.
 * @param {number|string} user.utilisateur_id - Identifiant de l'utilisateur.
 * @param {string} user.prenom - Prénom de l'utilisateur.
 * @param {string} user.nom - Nom de l'utilisateur.
 * @param {string} user.email - Email de l'utilisateur.
 * @param {string} JWT_SECRET - Clé secrète utilisée pour signer le token.
 * @returns {void}
 */
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

/**
 * Supprime le cookie d'authentification `monToken`, avec les mêmes
 * options que celles utilisées lors de sa création (nécessaire pour
 * que la suppression soit bien prise en compte par le navigateur).
 * @function clearCookie
 * @param {express.Response} res - Réponse Express sur laquelle supprimer le cookie.
 * @returns {void}
 */
export function clearCookie(res) {
   res.clearCookie('monToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
   });
}
