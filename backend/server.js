//===========================================================
//    FICHIER : server.js
//    PROJET  : ccmarket
//    DATE    : 01/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
// ==================================================
// Importation des modules 
// ==================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const annoncesRoutes = require('./routes/annonces');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/api/annonces', annoncesRoutes);
app.get('/:page.html', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, '../frontend/html', `${page}.html`);

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`Erreur : Le fichier ${page}.html n'existe pas.`);
            res.status(404).send("Désolé, cette page n'existe pas !");
        }
    });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});
// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur : http://localhost:${PORT}`);
}); 
