//===========================================================
//    FICHIER : logger.js
//    PROJET  : ccmarket
//    DATE    : 23/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuration ────────────────────────────────────────────────────────────
const LOG_FILE = path.join(__dirname, "errors.json");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Lit le fichier de log existant et retourne son contenu.
 * Retourne un tableau vide si le fichier n'existe pas encore.
 */
function readLogFile() {
  if (!fs.existsSync(LOG_FILE)) return [];
  try {
    const content = fs.readFileSync(LOG_FILE, "utf-8").trim();
    return content ? JSON.parse(content) : [];
  } catch {
    // Fichier corrompu → on repart de zéro
    return [];
  }
}

/**
 * Écrit le tableau d'erreurs dans le fichier JSON.
 */
function writeLogFile(entries) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Enregistre une erreur dans errors.json
 * @param {Error|unknown} error
 * @param {string}        context  - "chargement config", "appel API", etc.
 * @param {object}        [extra]  - données libres : userId, url, etc.
 * @param {string}        [source] - "backend" ou "frontend"
 */
export function logError(error, context = "inconnu", extra = {}, source = "backend") {
  const now = new Date();

  const entry = {
    source,
    date: now.toLocaleDateString("fr-FR"),
    heure: now.toLocaleTimeString("fr-FR"),
    timestamp: now.toISOString(),
    contexte: context,
    message: error instanceof Error ? error.message : String(error),
    type: error instanceof Error ? error.constructor.name : typeof error,
    stack: error instanceof Error ? (error.stack ?? null) : null,
    ...extra,
  };

  const entries = readLogFile();
  entries.push(entry);
  writeLogFile(entries);

  console.error(`[${source.toUpperCase()}][${entry.date} ${entry.heure}] ${context} → ${entry.message}`);
}


// ─── Exemple d'utilisation ────────────────────────────────────────────────────
// Décommentez le bloc ci-dessous pour tester directement avec : node logger.js

/*
const { logError } = require("./logger");

// Exemple 1 – erreur de lecture de fichier
try {
  const data = fs.readFileSync("/chemin/inexistant.json", "utf-8");
} catch (err) {
  logError(err, "lecture du fichier de configuration");
}

// Exemple 2 – erreur réseau avec données supplémentaires
async function fetchData() {
  try {
    const res = await fetch("https://api.exemple.com/data");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    logError(err, "appel API fetchData", { url: "https://api.exemple.com/data" });
  }
}

// Exemple 3 – erreur métier personnalisée
try {
  const user = null;
  if (!user) throw new Error("Utilisateur introuvable");
  console.log(user.name);
} catch (err) {
  logError(err, "récupération profil utilisateur", { userId: 42 });
}

fetchData();
*/
