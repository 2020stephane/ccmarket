const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const annoncesRoutes = require('./routes/annonces');

// Middleware : Autorise les requêtes provenant d'autres domaines (CORS)
app.use(cors());

// Middleware : Permet à Express de lire le JSON dans les requêtes entrantes
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', annoncesRoutes);
app.get('/:page.html', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, '../public/html', `${page}.html`);

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`Erreur : Le fichier ${page}.html n'existe pas.`);
            res.status(404).send("Désolé, cette page n'existe pas !");
        }
    });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/index.html'));
});
// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur : http://localhost:${PORT}`);
}); 