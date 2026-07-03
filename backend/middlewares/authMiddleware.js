/**
 * @fileoverview Middleware de vérification d'authentification via JWT.
 * Protège les routes nécessitant une connexion utilisateur.
 * @module authMiddleware
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-07-01
 * @author Stephane Brisse
 * @license MIT
 * @requires jsonwebtoken
 * @requires ../tools/logger.js
 */

import jwt from 'jsonwebtoken';
import { logError } from '../tools/logger.js';

/**
 * Vérifie la présence et la validité du token JWT stocké dans le cookie `monToken`.
 * Si le token est valide, les informations utilisateur décodées sont attachées
 * à `req.user` et la requête continue vers le prochain middleware/controller.
 * Si le token est absent ou invalide, la requête est bloquée avec un code 401.
 * @function verifierAuthentification
 * @param {express.Request} req - Requête Express entrante.
 * @param {express.Response} res - Réponse Express.
 * @param {express.NextFunction} next - Callback pour passer au middleware suivant.
 * @returns {void}
 */
export function verifierAuthentification(req, res, next) {
    const token = req.cookies?.monToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentification requise.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logError(error, 'FONCTION: verifierAuthentification, MODULE: authMiddleware.js');
        return res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré.'
        });
    }
}

/**
 * Vérifie que l'utilisateur authentifié possède le statut administrateur.
 * Doit être utilisé après `verifierAuthentification` (nécessite `req.user`).
 * @function verifierAdministrateur
 * @param {express.Request} req - Requête Express entrante.
 * @param {express.Response} res - Réponse Express.
 * @param {express.NextFunction} next - Callback pour passer au middleware suivant.
 * @returns {void}
 */
export function verifierAdministrateur(req, res, next) {
    if (!req.user?.administrateur) {
        return res.status(403).json({
            success: false,
            message: 'Accès réservé aux administrateurs.'
        });
    }
    next();
}
