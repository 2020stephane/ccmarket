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
 *  @function     getUtilisateurPublic
 *  @description  Retourne les informations publiques d'un utilisateur
 *                (utilisées par exemple pour afficher la fiche du
 *                vendeur sur la page détail d'une annonce).
 *                Ne renvoie JAMAIS l'email, le mot de passe, ou le
 *                statut administrateur.
 *  @async
 */
export async function getUtilisateurPublic(req, res) {
   try {
      const userId = Number(req.params.id);

      const [rows] = await db.execute(
         'SELECT utilisateur_id, prenom, nom, date_inscription FROM utilisateurs WHERE utilisateur_id = ?',
         [userId]
      );

      if (rows.length === 0) {
         return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      res.json(rows[0]);
   } catch (error) {
      logError(error, "FONCTION: getUtilisateurPublic, MODULE: utilisateursControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
export async function  patchUtilisateur(req, res) {
   const champs = req.body;
   const colonnesAutorisees = ['nom', 'prenom', 'email', 'motdepasse', 'avatar_url'];

   const entrees = Object.entries(champs).filter(([col]) =>
      colonnesAutorisees.includes(col)
   );

   if (entrees.length === 0) {

      return res.status(400).json({ message: 'Aucun champ valide fourni' });
   }

   const setClause = entrees.map(([col]) => `${col} = ?`).join(', ');
   const valeurs = entrees.map(([, val]) => val);

   try {
      const [result] = await db.execute(
         `UPDATE utilisateurs SET ${setClause} WHERE utilisateur_id = ?`,
         [...valeurs, req.params.id]
      );
      if (result.affectedRows === 0) {

         return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      res.json({ message: 'Utilisateur mise à jour' });
   } catch (error) {
      logError(error, "FONCTION: patchUtilisateur, MODULE:utilisateursControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
/**
 * @function patchMotDePasse
 * @description Modifie le mot de passe de l'utilisateur connecté
 * @route PATCH /api/utilisateurs/MDP)
 */
export async function  patchMotDePasse(req, res) {
 console.error("Entrer patch :");
     try {
        // 1. Récupération de l'ID utilisateur (depuis la session ou le token décodé)
        const userId = req.session?.user?.id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Non autorisé. Veuillez vous connecter."
            });
        }
        const { currentPassword, newPassword } = req.body;

        // 2. Validation des champs transmis
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Veuillez fournir le mot de passe actuel et le nouveau mot de passe."
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Le nouveau mot de passe doit contenir au moins 8 caractères."
            });
        }

        // 3. Récupération du mot de passe actuel de l'utilisateur en base de données
        // Adapter la requête selon votre ORM / client SQL (ex: MySQL, PostgreSQL, Prisma, etc.)
        const [users] = await db.query(
            "SELECT motdepasse FROM utilisateurs WHERE utilisateur_id = ?",
            [userId]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const user = users[0];
        // 4. Vérification de l'ancien mot de passe
        const isMatch = await bcrypt.compare(currentPassword, user.motdepasse);
        if (!isMatch) {
            return res.status(400).json({
                message: "Le mot de passe actuel est incorrect."
            });
        }

        // 5. Hachage du nouveau mot de passe
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // 6. Mise à jour dans la base de données
        await db.query(
            "UPDATE utilisateurs SET motdepasse = ? WHERE utilisateur_id = ?",
            [hashedNewPassword, userId]
        );

        // 7. Réponse succès
        return res.status(200).json({
            message: "Mot de passe mis à jour avec succès !"
        });

} catch (error) {
        logError(error, "FONCTION: patchMotDePasse, MODULE: utilisateursControllers.js");
      return res.status(500).json({
            message: "Erreur serveur lors de la modification du mot de passe."
        });
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

     res.clearCookie('monToken');
      res.json({ message: 'Utilisateur supprimé' });
   } catch (error) {
     logError(error, "FONCTION: supprimerUtilisateur, MODULE: utilisateursControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}

/**
 * @function deleteUserAccount
 * @description Supprime le compte d'un utilisateur et détruit sa session
 * @route DELETE /api/utilisateurs/:id
 */
export async function deleteUserAccount(req, res) {
    try {
        const userIdFromParams = req.params.id;
        const userIdFromSession = req.session?.user?.id || req.user?.id;

        // 1. Sécurité : vérifier que l'utilisateur connecté supprime BIEN son propre compte
        if (!userIdFromSession || userIdFromSession.toString() !== userIdFromParams.toString()) {
            return res.status(403).json({
                message: "Action non autorisée."
            });
        }

        // 2. Suppression dans la BDD (attention aux contraintes de clés étrangères)
        const [result] = await db.query(
            "DELETE FROM utilisateurs WHERE utilisateur_id = ?",
            [userIdFromParams]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // 3. Destrucion de la session serveur (si vous utilisez express-session)
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Erreur suppression session :", err);
                }
                res.clearCookie('monToken'); // Nom par défaut du cookie de session
                return res.status(200).json({ message: "Compte supprimé avec succès." });
            });
        } else {
            return res.status(200).json({ message: "Compte supprimé avec succès." });
        }

    } catch (error) {
        console.error("Erreur lors de la suppression du compte :", error);
        return res.status(500).json({
            message: "Erreur serveur lors de la suppression du compte."
        });
    }
}
