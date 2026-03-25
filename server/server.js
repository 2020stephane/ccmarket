const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware : Autorise les requêtes provenant d'autres domaines (CORS)
app.use(cors());

// Middleware : Permet à Express de lire le JSON dans les requêtes entrantes
app.use(express.json());
app.use(express.static(__dirname));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/img', express.static(path.join(__dirname, '../img')));
app.use('/js', express.static(path.join(__dirname, '../js')));
// Route de test (GET)
app.get('/api', (req, res) => {
    res.json({ message: "Le serveur Express fonctionne parfaitement !" });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/index.html'));
});
// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur : http://localhost:${PORT}`);
});