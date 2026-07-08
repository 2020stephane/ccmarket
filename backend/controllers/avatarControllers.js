/**
 * =======================================================
 *  @fileoverview  avatarControllers.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-07-08
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { logError } from "../tools/logger.js";
import db from '../bdd/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getAvatarByIdUser(req, res) {
     try {
      const [rows] = await db.execute(
         'SELECT * FROM avatar WHERE utilisateur_id = ?', [req.params.id]
      );
      if (rows.length === 0) {
         return res.status(404).json({ message: 'avatar introuvable' });
      }
      const tmp = rows[0];
      res.status(200).json(tmp);
   } catch (error) {
      logError(error, "FONCTION: getAnnonceById, MODULE: postmanControllers.js");
      res.status(500).json({ message: 'Erreur serveur' });
   }
}
export async function postAvatar(req, res) {
     try {
   const { user_id } = req.body;

   let image_nom = null;
         if (req.files && req.files.fichier) {
               const photo = req.files.fichier;
               const extension = photo.name.split('.').pop().toLowerCase();
               const extensions_autorisees = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

               if (!extensions_autorisees.includes(extension)) {
                   return res.status(400).json({ message: 'Format de fichier non autorisé' });
               }

               image_nom = Date.now() + '_' + photo.name;
               const chemin_final = path.join(__dirname, '..', '..', 'frontend', 'img', 'avatar',image_nom);

               await photo.mv(chemin_final);
         }
         if (image_nom) {
            await db.execute(
                'INSERT INTO avatar (avatar_url, utilisateur_id) VALUES (?, ?)',
                [image_nom, user_id]
            );
      }

      return res.status(201).json({ message: 'Annonce publiée avec succès' });
   } catch (error) {
       logError(error, "FONCTION: publierAnnonce, MODULE: annoncesControllers.js");
       return res.status(500).json({ message: 'Erreur serveur' });
   }
}
