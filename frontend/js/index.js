/**
 * =======================================================
 *  @fileoverview  index.js
 *  @project       ccmarket
 *  @description   Gestion de la navigation et du menu
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
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
let annonces_info = [];

verifierConnection();
init();

async function init() {
  await chargerAnnonces();
  afficheAnnonces();
}

/**
 * =======================================================
 *  @function     chargerAnnonces
 *  @description  Extrait toutes les annonces de la base de données
 *  @description  Triées par date de publication décroissante
 *  @async
 * =======================================================
 */
async function chargerAnnonces() {
   try {
      const response = await fetch("/api/annonces/derniers_ajouts",);
      const tmp = await response.json();
      localStorage.setItem("annonces", JSON.stringify(tmp));
      annonces_info.length = 0;
      tmp.forEach(item => annonces_info.push(item));
   } catch (error){
      const pGrid = document.querySelector(".annonces-grid");
      pGrid.innerHTML = "<li>Impossible de charger les annonces.</li>";
      logError(error, "dans le module:index.js");
   }
}
/**
 * =======================================================
 *  @function     afficheAnnonces
 *  @description  Génère le code HTML et affiche
 *                la liste des annonces dans le DOM
 * =======================================================
 */
function afficheAnnonces() {
   const pGrid = document.querySelector(".annonces-grid");
   if (annonces_info.length === 0) {
      pGrid.innerHTML = "<li>Aucune annonce pour le moment.</li>";
      return;
    }
    pGrid.innerHTML = "";
    annonces_info.forEach((annonce) => {
        let imageNom;
        if (annonce.photos.length > 0 && annonce.photos[0] !== "") {
            imageNom = `/uploads/${annonce.photos[0]}`;
        } else {
            imageNom = "/uploads/default.png";
        }
      const datePub = new Date(annonce.date_publication);
      const fiche = `
                <li>
                    <article class="ad-card">

                        <figure class="li-img ad-image-placeholder">
                            <img src="${imageNom}" alt="${annonce.titre}" loading="lazy">
                        </figure>

                        <div class="annonce_content ad-details">
                            <div class="ad-header">
                                <h3 class="ad-title">${annonce.titre}</h3>
                                <p class="ad-price">${parseFloat(annonce.prix).toLocaleString("fr-FR")} €</p>
                            </div>
                            <div class="ad-middle">
                                <p class="ad-meta">Catégorie : ${annonce.categorie_id}</p>
                                <p class="ad-date"> Publié le : <time datetime="${datePub.toISOString()}">
                                        ${datePub.toLocaleDateString()}</time></p>
                            </div>
                            <p class="ad_descriptif">${annonce.descriptif}</p>
                        </div>
                    </article>
                </li>
            `;
      pGrid.insertAdjacentHTML("beforeend", fiche);
    });
}
