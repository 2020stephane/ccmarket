/**
 * @fileoverview Initialisation et export du pool de connexions MySQL.
 * Utilise mysql2 avec support des promesses.
 * @module db
 * @project ccmarket
 * @version 1.0.0
 * @date 2026-06-11
 * @author Stephane Brisse
 * @license MIT
 * @requires mysql2
 * @requires dotenv/config
 * @requires ../tools/logger.js
 */

import mysql      from 'mysql2';
import 'dotenv/config';

import { logError } from '../tools/logger.js';

/**
 * Pool de connexions MySQL (interface promises de `mysql2`), configuré
 * à partir des variables d'environnement `DB_HOST`, `DB_USER`,
 * `DB_PASSWORD`, `DB_NAME` et `DB_PORT`.
 * En cas d'échec de création du pool, l'erreur est journalisée via
 * `logError` puis relancée, ce qui interrompt le démarrage du serveur.
 * @type {mysql2/promise.Pool}
 * @const
 */
let db;

try {
   db = mysql.createPool({
      host             : process.env.DB_HOST,
      user             : process.env.DB_USER,
      password         : process.env.DB_PASSWORD,
      database         : process.env.DB_NAME,
      port             : process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit  : 10,
   }).promise();
   console.log(`✅  CreatePool crée sur : ${process.env.DB_NAME}`);

} catch (error) {
   logError(error,'Échec de la connexion à la BDD');
   console.log(`⚠️  ATTENTION : Impossible de se connecter à la BDD (XAMPP est probablement éteint).`);
}

export default db;
