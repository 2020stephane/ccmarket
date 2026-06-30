/**
 * =======================================================
 *  @fileoverview  publication.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-06-29
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/js/tools/logger.js";

verifierConnection();

const formPublier = document.querySelector("form");
const userinfo = JSON.parse(localStorage.getItem("userinfo") || "null");
if (!userinfo) window.location.href = "index.html";
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

/**
 * =======================================================
 *  @function     publier
 *  @description  publie une annonce
 *  @async
 * =======================================================
 */
async function publier() {

     const formData = new FormData(formPublier);
     formData.append("utilisateur_id", userinfo.id);
     try {
          const res = await fetch("/api/annonces/publierannonce", {
               method: "POST",
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
