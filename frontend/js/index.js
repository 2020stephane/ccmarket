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
import { chargerAnnonces } from "/js/utils/annonces.js";
import { chargerCategories } from "/js/utils/categories.js";
import { chargerStat } from "/js/utils/annonces.js";
/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
let annoncesInfo = [];

const data = await verifierConnection();


await chargerAnnonces(50, 0, null);
await afficheAnnonces();
await chargerCategories();
await afficherFormCategories();
await afficherCategories();
await chargerStat();
initEventAnnonce();
initEventRecherche();
initEventCategories();
/**
 * =======================================================
 *  @function     afficheAnnonces
 *  @description  Génère le code HTML et affiche
 *                la liste des annonces dans le DOM
 * =======================================================
 */
async function afficheAnnonces() {
     const pGrid = document.querySelector(".annonces-grid");
     const annoncesInfo = JSON.parse(localStorage.getItem('derniersAjouts'));
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
 *  @function     afficherFormCategories
 *  @description
 *
 * =======================================================
 */
async function afficherFormCategories() {
     const categories = JSON.parse(localStorage.getItem('categories'));
     categories.forEach((categorie,index) => {
          const ptrspan = document.getElementById(`option_${index+1}`);
          ptrspan.textContent = categories[index].nom;
     });
}

/**
 * =======================================================
 *  @function     afficheCategories
 *  @description
 *
 * =======================================================
 */
async function afficherCategories() {
     const ptrGrid = document.querySelector(".categories-grid");
     const categories = JSON.parse(localStorage.getItem('categories'));
     const stat = JSON.parse(localStorage.getItem('annoncesStat'));
     const tabIcon = [ `🪑 `, `⚡`, `🍳`, `🚰`, `🛏️`, `📺`, `🏕️` ];

     ptrGrid.innerHTML = "";

     categories.forEach((categorie, index) => {
          const fiche = `
               <div class="category-card" data-id="${categorie.categorie_id}">
                    <span class="category-icon">${tabIcon[index]}</span>
                    <h3>${categorie.nom}</h3>
                    <p><span>${stat.parCategorie[index].total_categorie}</span> annonces</p>
               </div>
          `;
          ptrGrid.insertAdjacentHTML("beforeend", fiche);
     });
}
/**
 * =======================================================
 *  @function     afficherStat
 *  @description
 *
 * =======================================================
 */
async function afficherStat() {
     const ptrGrid = document.querySelector(".categories-grid");
     const categories = JSON.parse(localStorage.getItem('categories'));
     const tabIcon = [ `🪑 `, `⚡`, `🍳`, `🚰`, `🛏️`, `📺`, `🏕️` ];

     ptrGrid.innerHTML = "";

     categories.forEach((categorie, index) => {
          const fiche = `
               <div class="category-card" data-id="${categorie.categorie_id}">
                    <span class="category-icon">${tabIcon[index]}</span>
                    <h3>${categorie.nom}</h3>
                    <p>142 annonces</p>
               </div>
          `;
          ptrGrid.insertAdjacentHTML("beforeend", fiche);
     });
}
/**
 * Gestionnaire d'événements sur la grille de catégories
 */
function initEventCategories() {
     const ptrGrid = document.querySelector(".categories-grid");
     if (!ptrGrid) return;

     ptrGrid.addEventListener("click", async (e) => {
          const card = e.target.closest(".category-card");
          if (!card) return;
          const categoryId = card.dataset.id;

          await chargerAnnonces(50, categoryId, null);
          await afficheAnnonces();
          showTitleCategorie(categoryId);
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
     const annoncesInfo = JSON.parse(localStorage.getItem('derniersAjouts')) || [];
    if (annoncesInfo.length === 0) { return; }

    document.querySelector(".annonces-grid").addEventListener("click", (e) => {
        const card = e.target.closest(".ad-card");
        if (!card) { return };
        const tmp = annoncesInfo.find(tmp => tmp.annonce_id ==  card.dataset.annonceid);

        localStorage.setItem("annonceInfo", JSON.stringify(tmp));
        window.location.href = `details.html`;
    });
}

/**
 * =======================================================
 *  Gestion de la recherche d'annonces
 * =======================================================
 */
function initEventRecherche() {
     const searchForm = document.querySelector(".search-form");

     if (!searchForm) return;

     searchForm.addEventListener("submit", async (e) => {
          e.preventDefault();

          const formData = new FormData(searchForm);
          const keyword = formData.get("keyword").trim();
          const category = formData.get("category");

          const limite = 50;
console.log('category = ',category);
          await chargerAnnonces(limite, category, keyword);
          await afficheAnnonces();
          showTitleCategorie(category);
          initEventAnnonce();
     });
     }
function showTitleCategorie(categorie) {
     const tabIcon = [ `🪑 `, `⚡`, `🍳`, `🚰`, `🛏️`, `📺`, `🏕️` ];
     const categories = JSON.parse(localStorage.getItem('categories'));
     const ptrTitleCategorie = document.getElementById("section-title-categorie");
     if (categorie > 0) {
          ptrTitleCategorie.textContent = `${tabIcon[categorie-1]}${categories[categorie-1].nom}`;
     } else {
          ptrTitleCategorie.textContent = `Toutes les catégories`;
     }

}
