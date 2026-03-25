const express = require("express");
const cors = require("cors");
const annoncesRouter = require("./routes/annonces");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/annonces", annoncesRouter);
app.use(express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 
// Route principale → index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});
 
// Gérer les autres routes HTML (si tu as plusieurs pages)
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, 'html', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).sendFile(path.join(__dirname, 'html', 'index.html'));
    }
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
