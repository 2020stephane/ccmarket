/**
 * =======================================================
 *  @fileoverview  db.js
 *  @module        db
 *  @project       ccmarket
 *  @description   Initialisation et export du pool de connexions MySQL.
 *                 Utilise mysql2 avec support des promesses.
 *  @version       1.0.0
 *  @date          2026-06-11
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */

/**
 * =======================================================
 *  Importation des modules externes
 * =======================================================
 */
import mysql      from 'mysql2';
import 'dotenv/config';

/**
 * =======================================================
 *  Importation des modules internes
 * =======================================================
 */
import { logError } from '../tools/logger.js';

/**
 * =======================================================
 *  Initialisation du pool de connexions MySQL
 * =======================================================
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

   console.log(`✅  Connexion établie à la BDD : ${process.env.DB_NAME}`);

} catch (error) {
   logError(error,'Échec de la connexion à la BDD');
   throw error;
}

export default db;

