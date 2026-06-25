/**
 * =======================================================
 *  @fileoverview  server.js
 *  @module        server
 *  @project       ccmarket
 *  @description   Point d'entrée principal du serveur Express.
 *                 Configure les middlewares, les routes et démarre l'application.
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */

/**
 * =======================================================
 *  Importation des modules externes
 * =======================================================
 */
import 'dotenv/config';
import express           from 'express';
import cors              from 'cors';
import path              from 'path';
import cookieParser      from 'cookie-parser';
import fileUpload        from 'express-fileupload';
import { fileURLToPath } from 'url';

/**
 * =======================================================
 *  Importation des modules internes
 * =======================================================
 */
import postmanRoutes          from './backend/routes/postman.js';
import annoncesRoutes         from './backend/routes/annonces.js';
import utilisateursRoutes     from './backend/routes/utilisateurs.js';
import contactRoutes          from './backend/routes/contacter.js';
import authentificationRoutes from './backend/routes/auth2.js';
import authentificationGoogle from './backend/routes/auth.js';
/**
 * =======================================================
 *  Déclaration des variables
 * =======================================================
 */
const app        = express();
const PORT       = process.env.NS_PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

if (!process.env.NS_PORT) {
   console.warn('⚠️  NS_PORT non défini dans .env — port 3000 utilisé par défaut');
}

/**
 * =======================================================
 *  Configuration des middlewares
 * =======================================================
 */
app.use(cors());
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
/**
 * =======================================================
 *  Déclaration des fichiers statiques
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
