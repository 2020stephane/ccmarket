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

/**
 * Nettoie et formate le stack trace :
 * - supprime les lignes node_modules
 * - raccourcit les chemins absolus vers le projet
 * - retourne un tableau de lignes
 */
function formatStack(stack, projectRoot = process.cwd()) {
  if (!stack) return null;
return stack
    .split("\n")
    .filter(line => !line.includes("node_modules"))   // supprime le bruit
    .map(line =>
      line
        .replace(/\\/g, "/")                           // Windows → slash unix
        .replace(projectRoot.replace(/\\/g, "/"), "~") // chemin absolu → ~
        .trim()
    )
    .filter(Boolean);                                  // supprime les lignes vides
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
  const rawMessage = error instanceof Error ? error.message : String(error);
  const entry = {
    source,
    date: now.toLocaleDateString("fr-FR"),
    heure: now.toLocaleTimeString("fr-FR"),
    timestamp: now.toISOString(),
    contexte: context,
    message: rawMessage || "(aucun message — voir stack ou extra)",
    type: error instanceof Error ? error.constructor.name : typeof error,
    stack: formatStack(error instanceof Error ? error.stack ?? null : null),
    ...(Object.keys(extra).length > 0 ? { extra } : {}),
  };

  const entries = readLogFile();
  entries.push(entry);
  writeLogFile(entries);

  console.error(`[${source.toUpperCase()}][${entry.date} ${entry.heure}] ${context} → ${entry.message}`);
}
