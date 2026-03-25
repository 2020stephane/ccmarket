const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware : Autorise les requêtes provenant d'autres domaines (CORS)
app.use(cors());

// Middleware : Permet à Express de lire le JSON dans les requêtes entrantes
app.use(express.json());

// Route de test (GET)
app.get('/', (req, res) => {
    res.json({ message: "Le serveur Express fonctionne parfaitement !" });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur : http://localhost:${PORT}`);
});