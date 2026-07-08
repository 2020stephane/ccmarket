/**
 * =======================================================
 *  @fileoverview  details.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-07-08
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */

import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/tools/logger.js";

/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */

const data = await verifierConnection();
const annonceId = Number(new URLSearchParams(window.location.search).get("id"));
let annonceInfo = null;

chargerAnnonce();
afficherAnnonce();

function chargerAnnonce() {
     annonceInfo = JSON.parse(localStorage.getItem("annonceInfo"));
     console.log('annonce = ', annonceInfo);
}
function afficherAnnonce() {
     if (annonceInfo) {
          const aDesPhotos = annonceInfo.photos && annonceInfo.photos.length > 0;
          const imagePath = aDesPhotos
               ? `/uploads/${annonceInfo.photos[0]}`
               : '/uploads/default.png';
          const datePub = new Date(annonceInfo.date_publication);
          document.getElementById("titre").textContent = annonceInfo.titre;
          document.getElementById("prix").textContent = annonceInfo.prix;
          document.getElementById("categorie").textContent = annonceInfo.nom_categorie;
          document.getElementById("descriptif").textContent = annonceInfo.descriptif;
          document.getElementById("date").textContent = datePub;
          document.querySelector(".details-img img").src = imagePath;
          document.querySelector(".details-img img").alt = annonceInfo.titre;
     }
}
