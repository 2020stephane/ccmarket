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
 * @requires node-cron
 */

import 'dotenv/config';
import db                from "./backend/bdd/db.js";
import { testDatabaseConnection } from "./backend/bdd/testdb.js";
import express           from 'express';
import cors              from 'cors';
import path              from 'path';
import cookieParser      from 'cookie-parser';
import fileUpload        from 'express-fileupload';
import { fileURLToPath } from 'url';
import cron              from "node-cron";

import { lancerModeration }   from "./backend/jobs/moderation.js";

import postmanRoutes          from './backend/routes/postman.js';
import annoncesRoutes         from './backend/routes/annonces.js';
import utilisateursRoutes     from './backend/routes/utilisateurs.js';
import messagesRoutes         from './backend/routes/messages.js';
import contactRoutes          from './backend/routes/contacter.js';
import authRoutes             from './backend/routes/auth.js';
import logErrorRoutes         from './backend/routes/logError.js';
import avatarRoutes           from './backend/routes/avatar.js';
import geminiRoutes           from './backend/routes/gemini.js';

/**
 * Instance principale de l'application Express.
 * @type {express.Express}
 * @const
 */
const app = express();

/**
 * Environnement d'exécution (`development`, `production`, ...).
 * @type {string}
 * @const
 */
const NODE_ENV = process.env.NODE_ENV || 'development';
/**
 * Port d'écoute du serveur, défini via la variable d'environnement
 * NS_PORT (3000 par défaut).
 * @type {number}
 * @const
 */
const PORT = Number(process.env.NS_PORT) || 3000;

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
 * Ajoute l'en-tête `Cross-Origin-Opener-Policy` pour autoriser les
 * popups (ex : OAuth, fenêtres d'authentification).
 * @function coopMiddleware
 * @param {express.Request} req - Requête entrante.
 * @param {express.Response} res - Réponse à renvoyer.
 * @param {express.NextFunction} next - Passe la main au middleware suivant.
 * @returns {void}
 */
function coopMiddleware(req, res, next) {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
}
app.use(coopMiddleware);

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
 * Le secret permet de signer/vérifier les cookies sensibles.
 * @function
 */
app.use(cookieParser(process.env.COOKIE_SECRET));

/**
 * Middleware de gestion de l'upload de fichiers (`multipart/form-data`).
 * Limité à 10 Mo par fichier et utilise des fichiers temporaires sur
 * disque plutôt que de tout charger en mémoire.
 * @function
 * @name fileUploadMiddleware
 */
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: '/tmp/',
    safeFileNames: true,
    preserveExtension: true,
}));

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
 * Route API dédiée à la mise en relation avec l'administrateur
 * @name /api/contacter
 * @function
 */
app.use('/api/contacter', contactRoutes);

/**
 * Route API dédiée à la gestion des messages
 * @name /api/messages
 * @function
 */
app.use('/api/messages', messagesRoutes);

/**
 * Route API dédiée à la gestion des avatars
 * @name /api/avatar
 * @function
 */
app.use('/api/avatar', avatarRoutes);

/**
 * Route dédiée à l'authentification (inscription, connexion, déconnexion,
 * vérification de session).
 * @name /auth
 * @function
 */
app.use('/api/auth', authRoutes);

/**
 * Route API dédiée à la journalisation des erreurs.
 * @name /api/log_error
 * @function
 */
app.use('/api/log_error', logErrorRoutes);

/**
 * Route API dédiée gemini.
 * @name /api/gemini
 * @function
 */
app.use("/api/gemini", geminiRoutes);

/**
 * Sert les fichiers statiques du frontend à la racine du site,
 * avec mise en cache navigateur en production.
 * @name staticHtml
 * @function
 */
app.use(express.static(path.join(__dirname, 'frontend'), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0,
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html','index.html'));
});
/**
 * Gestionnaire pour toute route API inconnue (404 JSON plutôt que
 * la page HTML par défaut d'Express).
 * @function notFoundHandler
 * @param {express.Request} req - Requête entrante.
 * @param {express.Response} res - Réponse à renvoyer.
 * @returns {void}
 */
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Route introuvable.' });
});

//  testDatabaseConnection();
//    cron.schedule("0 10 * * *", () => {
//      lancerModeration();
// });
/**
 * Démarre le serveur : vérifie la connexion à la base de données,
 * planifie la tâche de modération quotidienne, puis met le serveur
 * HTTP en écoute.
 * @async
 * @function startServer
 * @returns {Promise<void>}
 * @throws {Error} Si la connexion à la base de données échoue.
 */
async function startServer() {
    await testDatabaseConnection();

    cron.schedule('0 8 * * *', async () => {
        try {
            await lancerModeration();
        } catch (err) {
            console.error('❌ Échec de la tâche de modération planifiée :', err);
        }
    });

    const server = app.listen(PORT, () => {
        console.log(`✅ Serveur démarré sur : http://localhost:${PORT} [${NODE_ENV}]`);
    });

    server.on('error', (err) => {
        console.error('❌ Impossible de démarrer le serveur :', err);
        process.exit(1);
    });

    /**
     * Ferme proprement le serveur HTTP et la connexion à la base de
     * données à la réception d'un signal d'arrêt.
     * @function gracefulShutdown
     * @param {string} signal - Signal reçu (SIGTERM, SIGINT...).
     * @returns {void}
     */
    function gracefulShutdown(signal) {
        console.log(`\n🛑 Signal ${signal} reçu, arrêt en cours...`);
        server.close(async () => {
            try {
                if (db && typeof db.end === 'function') {
                    await db.end();
                }
            } catch (err) {
                console.error('Erreur lors de la fermeture de la base de données :', err);
            } finally {
                process.exit(0);
            }
        });
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
    console.error('❌ Rejection non gérée :', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Exception non interceptée :', err);
    process.exit(1);
});

startServer().catch((err) => {
    console.error('❌ Échec du démarrage du serveur :', err);
    process.exit(1);
});
