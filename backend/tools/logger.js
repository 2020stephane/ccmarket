/**
 * @fileoverview Outil de journalisation applicatif : enregistre les
 * erreurs backend et frontend dans un fichier `errors.json`.
 * @module logger
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-24
 * @author Stephane Brisse
 * @license MIT
 * @requires fs
 * @requires path
 * @requires url
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Chemin absolu du fichier courant (équivalent de `__filename` en ESM).
 * @type {string}
 * @const
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Chemin absolu du répertoire courant (équivalent de `__dirname` en ESM).
 * @type {string}
 * @const
 */
const __dirname = path.dirname(__filename);

/**
 * Chemin absolu du fichier JSON dans lequel sont enregistrées les erreurs.
 * @type {string}
 * @const
 */
const LOG_FILE = path.join(__dirname, "errors.json");

/**
 * Lit le fichier de log existant et retourne son contenu.
 * Retourne un tableau vide si le fichier n'existe pas encore, ou s'il
 * est corrompu (JSON invalide).
 * @function readLogFile
 * @returns {Array<Object>} Le tableau des entrées de log déjà enregistrées.
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
 * Écrit le tableau d'erreurs dans le fichier JSON, avec une
 * indentation de 2 espaces.
 * @function writeLogFile
 * @param {Array<Object>} entries - Le tableau complet des entrées à sauvegarder.
 * @returns {void}
 */
function writeLogFile(entries) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

/**
 * Nettoie et formate un stack trace pour le rendre plus lisible :
 * supprime les lignes provenant de `node_modules`, remplace les
 * chemins absolus du projet par `~`, et retourne un tableau de lignes.
 * @function formatStack
 * @param {string|null|undefined} stack - Le stack trace brut à formater.
 * @param {string} [projectRoot=process.cwd()] - Racine du projet utilisée pour raccourcir les chemins.
 * @returns {Array<string>|null} Le tableau des lignes du stack nettoyées, ou `null` si aucun stack fourni.
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

/**
 * Enregistre une erreur dans `errors.json` et l'affiche dans la
 * console. Chaque entrée contient la date, l'heure, le contexte,
 * le message, le type d'erreur, le stack trace nettoyé, et des
 * données additionnelles libres.
 * @function logError
 * @param {Error|unknown} error - L'erreur à journaliser (instance d'`Error` ou toute autre valeur).
 * @param {string} [context="inconnu"] - Contexte de l'erreur, ex. `"chargement config"`, `"appel API"`.
 * @param {Object} [extra={}] - Données libres additionnelles : `userId`, `url`, etc.
 * @param {string} [source="backend"] - Origine de l'erreur : `"backend"` ou `"frontend"`.
 * @returns {void}
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
