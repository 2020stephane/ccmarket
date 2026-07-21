/**
 * @fileoverview Déclaration des routes liées aux annonces
 * (consultation, recherche, publication, modification, suppression).
 * @module annonces
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-07-01
 * @author Stephane Brisse
 * @license MIT
 * @requires express
 * @requires ../controllers/annoncesControllers.js
 * @requires ../middlewares/authMiddleware.js
 */

import express from 'express';
import {
   getAjouts,
   getAnnoncesByUser,
   putAnnonce,
   patchAnnonce,
   publierAnnonce,
   supprimerAnnonce,
   getCategories,
   getStatistiquesAnnonces,
   getStatistiquesAdmin
} from '../controllers/annoncesControllers.js';
import { verifierAuthentification, verifierRole } from '../middlewares/authMiddleware.js';

/**
 * Routeur Express dédié aux annonces.
 * @type {express.Router}
 * @const
 */
const router = express.Router();

/**
 * Route publique : récupère les dernières annonces publiées.
 * @name GET/derniers_ajouts
 * @function
 * @param {string} path - `/derniers_ajouts`
 * @param {Function} getAjouts - Contrôleur renvoyant les annonces les plus récentes.
 */
router.get('/derniers_ajouts', getAjouts);

/**
 * Route protégée : récupère les annonces publiées par un utilisateur donné.
 * Nécessite un utilisateur authentifié.
 * @name GET/mesannonces/:id
 * @function
 * @param {string} path - `/mesannonces/:id`
 * @param {Function} verifierAuthentification - Middleware vérifiant que l'utilisateur est connecté.
 * @param {Function} getAnnoncesByUser - Contrôleur renvoyant les annonces de l'utilisateur `id`.
 */
router.get('/mesannonces/:id', verifierAuthentification, getAnnoncesByUser);

/**
 * Route protégée : modifie partiellement une annonce existante.
 * Nécessite un utilisateur authentifié.
 * @name PATCH/modifierannonce/:id
 * @function
 * @param {string} path - `/modifierannonce/:id`
 * @param {Function} verifierAuthentification - Middleware vérifiant que l'utilisateur est connecté.
 * @param {Function} patchAnnonce - Contrôleur mettant à jour l'annonce ciblée par `id`.
 */
router.patch('/modifierannonce/:id', verifierAuthentification, patchAnnonce);

router.put('/putannonce/:id',  putAnnonce);

/**
 * Route protégée : publie une nouvelle annonce.
 * Nécessite un utilisateur authentifié.
 * @name POST/publierannonce
 * @function
 * @param {string} path - `/publierannonce`
 * @param {Function} verifierAuthentification - Middleware vérifiant que l'utilisateur est connecté.
 * @param {Function} publierAnnonce - Contrôleur créant la nouvelle annonce en base.
 */
router.post('/publierannonce', verifierAuthentification, publierAnnonce);

/**
 * Route protégée : supprime définitivement une annonce.
 * Nécessite un utilisateur authentifié.
 * @name DELETE/supprimerannonce/:id
 * @function
 * @param {string} path - `/supprimerannonce/:id`
 * @param {Function} verifierAuthentification - Middleware vérifiant que l'utilisateur est connecté.
 * @param {Function} supprimerAnnonce - Contrôleur supprimant l'annonce ciblée par `id`.
 */
router.delete('/supprimerannonce/:id', verifierAuthentification, supprimerAnnonce);

/**
 * Route publique : récupère la liste des catégories d'annonces.
 * @name GET/getCategories
 * @function
 * @param {string} path - `/getCategories`
 * @param {Function} getCategories - Contrôleur renvoyant la liste des catégories.
 */
router.get('/getCategories', getCategories);

/**
 * Route publique : récupère des statistiques générales sur les annonces
 * (ex. nombre total, répartition par catégorie...).
 *
 * ATTENTION : contrairement aux autres routes protégées de ce fichier,
 * aucun middleware `verifierAuthentification` n'est appliqué ici. À confirmer
 * si c'est volontaire (statistiques publiques) ou un oubli.
 *
 * @name GET/getStatistiques
 * @function
 * @param {string} path - `/getStatistiques`
 * @param {Function} getStatistiquesAnnonces - Contrôleur renvoyant les statistiques des annonces.
 */
router.get('/getStatistiques', getStatistiquesAnnonces);

/**
 * Route destinée à l'administration : récupère des statistiques avancées.
 *
 * ATTENTION : ni `verifierAuthentification`, ni de vérification du rôle
 * administrateur ne sont appliqués sur cette route, alors que son nom
 * suggère un accès réservé aux administrateurs. Cela permettrait
 * actuellement à n'importe qui d'y accéder sans être connecté. À corriger
 * en ajoutant `verifierAuthentification` ainsi qu'un middleware de
 * vérification du rôle admin (à créer si besoin) avant de mettre en
 * production.
 *
 * @name GET/getStatAdmin
 * @function
 * @param {string} path - `/getStatAdmin`
 * @param {Function} getStatistiquesAdmin - Contrôleur renvoyant les statistiques réservées aux administrateurs.
 */
router.get('/getStatAdmin', verifierAuthentification, verifierRole('administrateur'), getStatistiquesAdmin);

export default router;
