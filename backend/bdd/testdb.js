
import db from "./db.js";
import 'dotenv/config';

import { logError } from '../tools/logger.js';

// 1. Définition de la fonction qui gère le succès de la connexion
function handleSuccess(connection) {
  // Récupération du nom de la base de données depuis les variables d'environnement
  const dbName = process.env.DB_NAME;

  // Affichage du message de confirmation dans la console
  console.log(`✅ Connexion établie à la BDD : ${dbName}`);

  // Libération de la connexion pour la remettre à disposition dans le pool
  connection.release();
}

// 2. Définition de la fonction qui gère l'échec de la connexion
function handleError(error) {
  // Affichage du message d'avertissement
  console.log(`⚠️  ATTENTION : Impossible de joindre la BDD (XAMPP est probablement éteint).`);

  // (Optionnel) Vous pouvez inspecter le détail de l'erreur ici si besoin :
  // console.error("Détail de l'erreur :", error.message);
}

// 3. Définition d'une fonction de test de connexion réutilisable
export function testDatabaseConnection() {
  // Obtenir la promesse de connexion depuis le pool
  const connectionPromise = db.getConnection();

  // Attacher le gestionnaire de succès
  const successPromise = connectionPromise.then(handleSuccess);

  // Attacher le gestionnaire d'erreur
  const finalPromise = successPromise.catch(handleError);

  return finalPromise;
}
