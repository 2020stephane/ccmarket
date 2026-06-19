//===========================================================
//    FICHIER : server.js
//    PROJET  : ccmarket
//    DATE    : 01/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
// ==================================================
// Importation des modules
// ==================================================
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';

import db from './backend/bdd/db.js';

import annoncesRoutes from './backend/routes/annonces.js';
import utilisateursRoutes from './backend/routes/utilisateurs.js';
import authentificationRoutes from './backend/routes/auth.js';
// ==================================================
// Recréation de __dirname
// ==================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ==================================================
// affectation des variables
// ==================================================
const app = express();
const PORT =  process.env.NS_PORT;
// ==================================================
// Configuration des intergiciels
// ==================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use('/api/annonces', annoncesRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api', authentificationRoutes);

app.use(express.static(path.join(__dirname, '/frontend/html')));
app.use('/css', express.static(path.join(__dirname, '/frontend/css')));
app.use('/js', express.static(path.join(__dirname, '/frontend/js')));
app.use('/img', express.static(path.join(__dirname, '/frontend/img')));
app.use('/fonts', express.static(path.join(__dirname, '/frontend/fonts')));
app.use('/uploads', express.static(path.join(__dirname, '/frontend/uploads')));
// ==================================================
// Lancement du serveur
// ==================================================
app.listen(PORT, () => {
   console.log(`Serveur démarré sur : http://localhost:${PORT}`);
});
