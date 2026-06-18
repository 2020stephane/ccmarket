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

import { db } from './bdd/db.js';

import annoncesRoutes from './routes/annonces.js';
import utilisateursRoutes from './routes/utilisateurs.js';
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
// Connection a la bdd
// ==================================================
try {
   await db.query('SELECT 1');
   console.log('✅ Connexion à la base de données MySQL réussie (Pool actif).');
} catch (error) {
   console.error('❌ Erreur de connexion à la base de données :');
   console.error(error.message);
   process.exit(1);
}
// ==================================================
// Lancement du serveur
// ==================================================
app.listen(PORT, () => {
   console.log(`Serveur démarré sur : http://localhost:${PORT}`);
});
