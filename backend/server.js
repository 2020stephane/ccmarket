//===========================================================
//    FICHIER : server.js
//    PROJET  : ccmarket
//    DATE    : 01/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
// ==================================================
// Importation des modules 
// ==================================================
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const annoncesRoutes = require('./routes/annonces');
const authRoutes = require('./routes/connection');
// ==================================================
// affectation des variables
// ==================================================
const app = express();
const PORT = 3000;
// ==================================================
// Configuration des middleware
// ==================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use('/api', annoncesRoutes);
app.use('/api', authRoutes); 
app.use(express.static(path.join(__dirname, '../frontend/html')));
app.use('/css',express.static(path.join(__dirname, '../frontend/css')));
app.use('/js',express.static(path.join(__dirname, '../frontend/js')));
app.use('/img',express.static(path.join(__dirname, '../frontend/img')));
app.use('/fonts',express.static(path.join(__dirname, '../frontend/fonts')));
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
