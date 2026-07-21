/**
 * =======================================================
 *  @fileoverview  publication.js
 *  @project       ccmarket
 *  @description   Gère la publication d'une nouvelle annonce.
 *  @version       1.1.0
 *  @date          2026-07-01
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/js/tools/logger.js";
/**
 * =======================================================
 *  Constantes partagées
 * =======================================================
 */
const formPublier = document.querySelector("form");
/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
try {
     await verifierConnection();

     /** ===== MODEL ===== */
     /** ===== VIEW =====*/
     /** ===== CONTROLLERS ===== */
     initListener();

} catch (error) {
     logError(error,"Script principal, MODULE:publication.js");
}
/**
 * =======================================================
 *  @function     initListener
 *  @description  initialise les listeners.
 * =======================================================
 */
function initListener() {
     document.getElementById('inputphoto').addEventListener('change', (e) => {
          const fichier = e.target.files[0];
          document.getElementById('file-nom').textContent = fichier
               ? fichier.name
               : 'Aucun fichier choisi';
     });

     formPublier.addEventListener("submit", (e) => {
          e.preventDefault();
          publier();
     });
}


/**
 * =======================================================
 *  @function     publier
 *  @description  Publie une nouvelle annonce pour l'utilisateur connecté.
 *                L'identité de l'utilisateur est déduite côté serveur
 *                à partir du token JWT (cookie monToken) — aucun identifiant
 *                utilisateur n'est envoyé depuis le client.
 *  @async
 * =======================================================
 */
async function publier() {
     const formData = new FormData(formPublier);
     try {
          const res = await fetch("/api/annonces/publierannonce", {
               method: "POST",
               credentials: "include",
               body: formData
          });

          if (res.ok) {
               alert("Annonce publiée avec succès !");
               window.location.href = "mesannonces.html";
          } else {
               const errData = await res.json();
               alert(`Erreur lors de la publication : ${errData.message || 'Erreur inconnue'}`);
          }
     } catch (error) {
          logError(error, "FONCTION: publier, MODULE:publication.js");
          console.error("Erreur lors de l'envoi :", error);
     }
}
