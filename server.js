/**
 * @fileoverview Point d'entrée principal du serveur Express.
 * Configure les middlewares, les routes et démarre le serveur.
 * @module server
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-24
 * @author Stephane Brisse
 * @license MIT
 * @requires dotenv/config
 * @requires express
 * @requires cors
 * @requires path
 * @requires cookie-parser
 * @requires express-fileupload
 * @requires url
 */

import 'dotenv/config';
import db from "./backend/bdd/db.js";
import express           from 'express';
import cors              from 'cors';
import path              from 'path';
import cookieParser      from 'cookie-parser';
import fileUpload        from 'express-fileupload';
import { fileURLToPath } from 'url';

import postmanRoutes          from './backend/routes/postman.js';
import annoncesRoutes         from './backend/routes/annonces.js';
import utilisateursRoutes     from './backend/routes/utilisateurs.js';
import messagesRoutes         from './backend/routes/messages.js';
import contactRoutes          from './backend/routes/contacter.js';
import authentificationRoutes from './backend/routes/auth.js';
import logErrorRoutes         from './backend/routes/logError.js';
import avatarRoutes           from './backend/routes/avatar.js';

/**
 * Instance principale de l'application Express.
 * @type {express.Express}
 * @const
 */
const app = express();

/**
 * Port d'écoute du serveur, défini via la variable d'environnement
 * NS_PORT (3000 par défaut).
 * @type {number}
 * @const
 */
const PORT = process.env.NS_PORT || 3000;

/**
 * Chemin absolu du fichier courant (équivalent de `__filename` en ESM).
 * @type {string}
 * @const
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Chemin absolu du répertoire courant (équivalent de `__dirname` en ESM).
 * @type {string}
 * @const
 */
const __dirname = path.dirname(__filename);

/**
 * Middleware CORS : autorise les requêtes cross-origin depuis le
 * front (`http://localhost:3000`) avec envoi des cookies (`credentials: true`).
 * @function
 * @name corsMiddleware
 */
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

/**
 * Middleware personnalisé : ajoute l'en-tête `Cross-Origin-Opener-Policy`
 * pour autoriser les popups (ex : OAuth, fenêtres d'authentification).
 * @function
 * @name coopMiddleware
 * @param {express.Request} req - Requête entrante.
 * @param {express.Response} res - Réponse à renvoyer.
 * @param {express.NextFunction} next - Passe la main au middleware suivant.
 */
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});

/**
 * Middleware de parsing du corps des requêtes au format JSON
 * (taille limitée à 2 Mo).
 * @function
 * @name jsonBodyParser
 */
app.use(express.json({ limit: '2mb' }));

/**
 * Middleware de parsing du corps des requêtes au format URL-encodé
 * (taille limitée à 2 Mo).
 * @function
 * @name urlencodedBodyParser
 */
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

/**
 * Middleware de parsing des cookies entrants.
 * @function
 * @name cookieParserMiddleware
 */
app.use(cookieParser());

/**
 * Middleware de gestion de l'upload de fichiers (`multipart/form-data`).
 * @function
 * @name fileUploadMiddleware
 */
app.use(fileUpload());

/**
 * Route API dédiée aux tests Postman.
 * @name /api/postman
 * @function
 */
app.use('/api/postman', postmanRoutes);

/**
 * Route API dédiée à la gestion des annonces.
 * @name /api/annonces
 * @function
 */
app.use('/api/annonces', annoncesRoutes);

/**
 * Route API dédiée à la gestion des utilisateurs.
 * @name /api/utilisateurs
 * @function
 */
app.use('/api/utilisateurs', utilisateursRoutes);

/**
 * Route API dédiée à la mise en relation entre utilisateurs
 * (contact au sujet d'une annonce).
 * @name /api/contacter
 * @function
 */
app.use('/api/contacter', contactRoutes);

/**
 * Route API dédiée à la gestion des messages
 * (contact au sujet d'une annonce).
 * @name /api/messages
 * @function
 */
app.use('/api/messages', messagesRoutes);

/**
 * Route API dédiée à la gestion des avatars
 * (contact au sujet d'une annonce).
 * @name /api/avatar
 * @function
 */
app.use('/api/avatar', avatarRoutes);

/**
 * Route dédiée à l'authentification (connexion, déconnexion,
 * vérification de session).
 * @name /auth
 * @function
 */
app.use('/auth', authentificationRoutes);

/**
 * Route API dédiée à la journalisation des erreurs côté client.
 * @name /api/log_error
 * @function
 */
app.use('/api/log_error', logErrorRoutes);

/**
 * Sert les fichiers HTML statiques du frontend à la racine du site.
 * @name staticHtml
 * @function
 */
app.use(express.static(path.join(__dirname, '/frontend/html')));

/**
 * Sert les feuilles de style CSS statiques sous `/css`.
 * @name staticCss
 * @function
 */
app.use('/css', express.static(path.join(__dirname, '/frontend/css')));

/**
 * Sert les scripts utilitaires JavaScript statiques sous `/tools`.
 * @name staticTools
 * @function
 */
app.use('/tools', express.static(path.join(__dirname, '/frontend/js/tools')));

/**
 * Sert les scripts JavaScript statiques du frontend sous `/js`.
 * @name staticJs
 * @function
 */
app.use('/js', express.static(path.join(__dirname, '/frontend/js')));

/**
 * Sert les images statiques du frontend sous `/img`.
 * @name staticImg
 * @function
 */
app.use('/img', express.static(path.join(__dirname, '/frontend/img')));

/**
 * Sert les polices statiques du frontend sous `/fonts`.
 * @name staticFonts
 * @function
 */
app.use('/fonts', express.static(path.join(__dirname, '/frontend/fonts')));

/**
 * Sert les fichiers uploadés par les utilisateurs sous `/uploads`.
 * @name staticUploads
 * @function
 */
app.use('/uploads', express.static(path.join(__dirname, '/frontend/uploads')));

db.getConnection()
   .then((connection) => {
      // Si on arrive ici, la connexion a fonctionné !
      console.log(`✅ Connexion établie à la BDD : ${process.env.DB_NAME}`);
      connection.release(); // Là, ça fonctionne car 'connection' est le vrai objet MySQL
   })
   .catch((error) => {
      // Si XAMPP est éteint, on affiche juste un avertissement sans faire planter le serveur
      console.log(`⚠️  ATTENTION : Impossible de joindre la BDD (XAMPP est probablement éteint).`);
   });

/**
 * Démarre le serveur Express et écoute les connexions entrantes
 * sur le port configuré.
 * @listens PORT
 * @param {number} PORT - Port d'écoute du serveur.
 * @param {Function} callback - Fonction exécutée une fois le serveur démarré.
 */
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur : http://localhost:${PORT}`);
});
