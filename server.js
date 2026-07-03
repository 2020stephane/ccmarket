/**
 *  @fileoverview  Point d'entrée principal du serveur Express.
 *                 Configure les middlewares, les routes et démarre le serveur.
 *  @module        server
 *  @project       ccmarket
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 */

/**
 * =======================================================
 *  Importation des modules
 * =======================================================
 */
import 'dotenv/config';
import express           from 'express';
import cors              from 'cors';
import path              from 'path';
import cookieParser      from 'cookie-parser';
import fileUpload        from 'express-fileupload';
import { fileURLToPath } from 'url';

import postmanRoutes          from './backend/routes/postman.js';
import annoncesRoutes         from './backend/routes/annonces.js';
import utilisateursRoutes     from './backend/routes/utilisateurs.js';
import contactRoutes          from './backend/routes/contacter.js';
import authentificationRoutes from './backend/routes/auth.js';
import logErrorRoutes         from './backend/routes/logError.js';
/**
 * =======================================================
 *  Déclaration des variables globales
 * =======================================================
 */

/**
 * Instance principale de l'application Express.
 * @type {express.Express}
 */
const app = express();

/**
 * Port d'écoute du serveur, défini via la variable d'environnement NS_PORT (3000 par défaut).
 * @type {number}
 */
const PORT = process.env.NS_PORT || 3000;

/**
 * Chemin absolu du fichier courant (équivalent __filename en ESM).
 * @type {string}
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Chemin absolu du répertoire courant (équivalent __dirname en ESM).
 * @type {string}
 */
const __dirname = path.dirname(__filename);
/**
 * =======================================================
 *  Configuration des middlewares
 * =======================================================
 */
// Autorise les requêtes cross-origin depuis le front (localhost:3000) avec envoi des cookies.
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Ajoute l'en-tête COOP pour autoriser les popups (ex: OAuth, fenêtres d'authentification).
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});

// Parsing du corps des requêtes en JSON (limite 2 Mo).
app.use(express.json({ limit: '2mb' }));
// Parsing du corps des requêtes URL-encodées (limite 2 Mo).
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Parsing des cookies entrants.
app.use(cookieParser());

// Gestion de l'upload de fichiers (multipart/form-data).
app.use(fileUpload());

/**
 * =======================================================
 *  Déclaration des routes API
 * =======================================================
 */
app.use('/api/postman',      postmanRoutes);
app.use('/api/annonces',     annoncesRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/contacter',    contactRoutes);
app.use('/auth',             authentificationRoutes);
app.use('/api/log_error',    logErrorRoutes);

/**
 * =======================================================
 *  Déclaration des repertoires statiques
 * =======================================================
 */
app.use(express.static(path.join(__dirname, '/frontend/html')));
app.use('/css',     express.static(path.join(__dirname, '/frontend/css')));
app.use('/tools',   express.static(path.join(__dirname, '/frontend/js/tools')));
app.use('/js',      express.static(path.join(__dirname, '/frontend/js')));
app.use('/img',     express.static(path.join(__dirname, '/frontend/img')));
app.use('/fonts',   express.static(path.join(__dirname, '/frontend/fonts')));
app.use('/uploads', express.static(path.join(__dirname, '/frontend/uploads')));

/**
 * =======================================================
 *  Démarre le serveur Express et écoute les connexions entrantes sur le port configuré
 * =======================================================
 */

app.listen(PORT, () => {
   console.log(`✅ Serveur démarré sur : http://localhost:${PORT}`);
});
