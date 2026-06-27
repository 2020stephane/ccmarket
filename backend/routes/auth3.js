/**
 * ==========================================================
 * @file         auth.js
 * @project      ccmarket
 * @description  Authentification Google + JWT + MySQL
 * @date         2026-06-25
 * ==========================================================
 */

import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import db from '../bdd/db.js';

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ==================================================
// Fonction utilitaire : générer un JWT local
// ==================================================
function genererToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ==================================================
// POST /auth/google
// ==================================================
router.post('/google', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Token manquant.'
        });
    }

    try {
        // 1. Vérification du token auprès de Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // BUG CORRIGÉ : "name" n'existait pas — on construit le nom depuis given_name + family_name
        const { email, given_name, family_name, picture } = payload;
        const nomComplet = `${given_name} ${family_name}`.trim();

        // 2. Chercher l'utilisateur en BDD
        const [rows] = await db.query(
            'SELECT * FROM utilisateurs WHERE email = ?',
            [email]
        );

        let utilisateur;

        if (rows.length === 0) {
            // 3a. Nouvel utilisateur → inscription automatique
            const [result] = await db.query(
                'INSERT INTO utilisateurs (nom, prenom, email, photo, administrateur) VALUES (?, ?, ?, ?, ?)',
                [family_name, given_name, email, picture, false]
            );
            utilisateur = {
                utilisateur_id: result.insertId,
                nom: family_name,
                prenom: given_name,
                email,
                administrateur: false
            };
        } else {
            // 3b. Utilisateur existant → récupération
            utilisateur = rows[0];
        }

        // 4. Génération du JWT local
        const jwtToken = genererToken({
            id: utilisateur.utilisateur_id,
            email: utilisateur.email,
            administrateur: utilisateur.administrateur
        });

        // 5. Réponse
        return res.status(200).json({
            success: true,
            token: jwtToken,
            user: {
                id: utilisateur.utilisateur_id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                administrateur: utilisateur.administrateur
            }
        });

    } catch (error) {
        console.error('Erreur auth Google:', error);
        return res.status(401).json({
            success: false,
            message: 'Token Google invalide ou expiré.'
        });
    }
});

// ==================================================
// POST /auth/login  (connexion classique avec bcrypt)
// ==================================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Validation des champs
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email et mot de passe requis.'
        });
    }

    try {
        // 2. Chercher l'utilisateur par email
        const [rows] = await db.query(
            'SELECT * FROM utilisateurs WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants incorrects.'
            });
        }

        const utilisateur = rows[0];

        // 3. Vérifier le mot de passe avec bcrypt
        const motDePasseValide = await bcrypt.compare(password, utilisateur.motdepasse);

        if (!motDePasseValide) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants incorrects.'
            });
        }

        // 4. Générer le JWT
        const token = genererToken({
            id: utilisateur.utilisateur_id,
            email: utilisateur.email,
            administrateur: utilisateur.administrateur
        });

        // 5. Réponse
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: utilisateur.utilisateur_id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                administrateur: utilisateur.administrateur
            }
        });

    } catch (error) {
        console.error('Erreur login:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur.'
        });
    }
});

export default router;
