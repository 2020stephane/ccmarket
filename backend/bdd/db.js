//===========================================================
//    FICHIER : db.js
//    PROJET  : ccmarket
//    DATE    : 11/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import mysql from 'mysql2';
import 'dotenv/config';

let db;
try {
db = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   port: process.env.DB_PORT,
   waitForConnections: true,
   connectionLimit: 10,
}).promise();
console.log('Database connection established successfully');
} catch (error) {
  console.error('Error establishing database connection:', error);
  throw error;
}
export default db;

