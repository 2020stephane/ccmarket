const express = require("express");
const cors = require("cors");
const annoncesRouter = require("./routes/annonces");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/annonces", annoncesRouter);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
