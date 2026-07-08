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
let annoncesInfo = [];

const data = await verifierConnection();

await chargerAnnonces();
afficheAnnonces();
initEventAnnonce();

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

      annoncesInfo.length = 0;
      tmp.forEach(item => annoncesInfo.push(item));

   } catch (error){
      const pGrid = document.querySelector(".annonces-grid");
      pGrid.innerHTML = "<li>Impossible de charger les annonces.</li>";
      logError(error, "FONCTION: chargerAnnonces, MODULE: index.js");
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

   if (annoncesInfo.length === 0) {
      pGrid.innerHTML = "<li>Aucune annonce pour le moment.</li>";
      return;
    }

    pGrid.innerHTML = "";

    annoncesInfo.forEach((annonce) => {
        let imageNom;

        if (annonce.photos.length > 0 && annonce.photos[0] !== "") {
            imageNom = `/uploads/${annonce.photos[0]}`;
        } else {
            imageNom = "/uploads/default.png";
        }

      const datePub = new Date(annonce.date_publication);
      const fiche = `
                <li>
                    <article data-annonceid="${annonce.annonce_id}" class="ad-card">

                        <figure class="li-img ad-image-placeholder">
                            <img src="${imageNom}" alt="${annonce.titre}" loading="lazy">
                        </figure>

                        <div class="annonce_content ad-details">
                            <div class="ad-header">
                                <h3 class="ad-title">${annonce.titre}</h3>
                                <p class="ad-price">${parseFloat(annonce.prix).toLocaleString("fr-FR")} €</p>
                            </div>
                            <div class="ad-middle">
                                <p class="ad-meta">Catégorie : ${annonce.nom_categorie}</p>
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
/**
 * =======================================================
 *  @function     initEventAnnonce
 *  @description  Initialise le gestionnaire d'évenement
 *                sur la liste des annonces
 * =======================================================
 */
function initEventAnnonce() {
    if (annoncesInfo.length === 0) { return; }

    document.querySelector(".annonces-grid").addEventListener("click", (e) => {
        const card = e.target.closest(".ad-card");
        if (!card) { return };
        const tmp = annoncesInfo.find(tmp => tmp.annonce_id ==  card.dataset.annonceid);

        localStorage.setItem("annonceInfo", JSON.stringify(tmp));
        window.location.href = `details.html`;
    });
}
