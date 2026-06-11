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

import annoncesRoutes from './routes/annonces.js';
import inscriptionRoutes from './routes/inscription.js';
import connectionRoutes from './routes/connection.js';
import authentificationRoutes from './routes/auth.js';
// ==================================================
// Recréation de __dirname
// ==================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ==================================================
// affectation des variables
// ==================================================
const app = express();
const PORT = 3000;
// ==================================================
// Configuration des intergiciels
// ==================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use('/api', annoncesRoutes);
app.use('/api', connectionRoutes);
app.use('/api', inscriptionRoutes);
app.use('/api', authentificationRoutes);

app.use(express.static(path.join(__dirname, '../frontend/html')));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/img', express.static(path.join(__dirname, '../frontend/img')));
app.use('/fonts', express.static(path.join(__dirname, '../frontend/fonts')));
app.use('/uploads', express.static(path.join(__dirname, '../frontend/uploads')));
// ==================================================
// '/' correspond à localhost:3000
// ==================================================
app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});
app.use((req, res) => {
   res.status(404).send("Désolé, cette page n'existe pas !");
});
// ==================================================
// Lancement du serveur
// ==================================================
app.listen(PORT, () => {
   console.log(`Serveur démarré sur : http://localhost:${PORT}`);
});
