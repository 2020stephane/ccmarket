/**
 * =======================================================
 *  @fileoverview  server.js
 *  @module        server
 *  @project       ccmarket
 *  @description   Point d'entrée principal du serveur Express.
 *                 Configure les middlewares, les routes et démarre le serveur
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
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
import authentificationRoutes from './backend/routes/auth2.js';
import authentificationGoogle from './backend/routes/auth.js';
import logErrorRoutes         from './backend/routes/logError.js';
/**
 * =======================================================
 *  Déclaration des variables
 * =======================================================
 */
const app        = express();
const PORT       = process.env.NS_PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/**
 * =======================================================
 *  Configuration des middlewares
 * =======================================================
 */
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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
app.use('/api',              authentificationRoutes);
app.use('/auth',             authentificationGoogle);
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
 *  Lancement du serveur
 * =======================================================
 */
app.listen(PORT, () => {
   console.log(`✅  Serveur démarré sur : http://localhost:${PORT}`);
});
