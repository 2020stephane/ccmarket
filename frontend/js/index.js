/**
 * =======================================================
 *  @fileoverview  index.js
 *  @project       ccmarket
 *  @description   Chargement et affichage des annonces et
 *                  des catégories, gestion de la recherche
 *                  et de la navigation sur la page d'accueil
 *  @version       1.0.1
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */

import { verifierConnection } from "/js/tools/authentification.js";
import { logError }           from "/js/tools/logger.js";
import { askGemini }          from "/js/tools/askGemini.js";
/**
 * =======================================================
 *  Constantes partagées
 * =======================================================
 */
const TAB_ICON = [`🪑 `, `⚡`, `🍳`, `🚰`, `🛏️`, `📺`, `🏕️`];

/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
try {
     await verifierConnection();

     /** ===== MODEL ===== */
     await chargerAnnonces(50, 0, null);
     await chargerCategories();
     await chargerStat();

     /** ===== VIEW =====*/
     await afficheAnnonces();
     await afficherFormCategories();
     await afficherCategories();

     /** ===== CONTROLLERS ===== */
     initEventAnnonce();
     initEventRecherche();
     initEventCategories();
// askGemini(`quel est ton nom?`);
} catch (error) {
     logError(error,"Script principal, MODULE:index.js");
}

/**
 * =======================================================
 *  @function     chargerAnnonces
 *  @description  Extrait (x) annonces de la base de données
 *  @description  Triées par date de publication décroissante
 *  @async
 * =======================================================
 */
async function chargerAnnonces(nombreAnnonces, categorie, keyword) {
   try {
     const params = new URLSearchParams({
          limite: nombreAnnonces,
          categorie: categorie,
          keyword: keyword
     });
     const response = await fetch(`/api/annonces/derniers_ajouts?${params}`);
     const tmp = await response.json();

     localStorage.setItem('derniersAjouts', JSON.stringify(tmp));

   } catch (error){
      logError(error, "FONCTION: chargerAnnonces, MODULE: /js/index.js");
   }
}
/**
 * =======================================================
 *  @function     chargerCategories
 *  @description  charge les différentes catégories
 *  @async
 * =======================================================
 */
export async function chargerCategories() {
   try {
     const response = await fetch(`/api/annonces/getCategories`);
     const tmp = await response.json();

     localStorage.setItem('categories', JSON.stringify(tmp));

   } catch (error){
      logError(error, "FONCTION: chargerCategories, MODULE: /js/index.js");
   }
}

/**
 * =======================================================
 *  @function     chargerStat
 *  @description  charge le nombre d'annonce par catégorie
 *  @async
 * =======================================================
 */
export async function chargerStat() {
   try {
     const response = await fetch(`/api/annonces/getStatistiques`);
     const tmp = await response.json();

     localStorage.setItem('annoncesStat', JSON.stringify(tmp));

   } catch (error){
      logError(error, "FONCTION: chargerStat, MODULE: /js/index.js");
   }
}
/**
 * =======================================================
 *  @function     afficheAnnonces
 *  @description  Génère le code HTML et affiche
 *                la liste des annonces dans le DOM
 * =======================================================
 */
async function afficheAnnonces() {
     const pGrid = document.querySelector(".annonces-grid");
     const annoncesInfo = JSON.parse(localStorage.getItem('derniersAjouts')) || [];

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
                         <p class="ad-descriptif">${annonce.descriptif}</p>
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
 *  @description  Remplit les options du <select> de recherche
 *                avec le nom de chaque catégorie
 * =======================================================
 */
async function afficherFormCategories() {
     const categories = JSON.parse(localStorage.getItem('categories')) || [];

     categories.forEach((categorie, index) => {
          const ptrspan = document.getElementById(`option_${index + 1}`);
          ptrspan.textContent = categorie.nom;
     });
}

/**
 * =======================================================
 *  @function     afficherCategories
 *  @description  Affiche la grille des catégories avec leur
 *                icône et le nombre d'annonces associées
 * =======================================================
 */
async function afficherCategories() {
     const ptrGrid = document.querySelector(".categories-grid");
     const categories = JSON.parse(localStorage.getItem('categories')) || [];
     const stat = JSON.parse(localStorage.getItem('annoncesStat'));

     ptrGrid.innerHTML = "";

     categories.forEach((categorie, index) => {
          const total = stat?.parCategorie?.[index]?.total_categorie ?? 0;
          const fiche = `
               <div class="category-card" data-id="${categorie.categorie_id}">
                    <span class="category-icon">${TAB_ICON[index]}</span>
                    <h3>${categorie.nom}</h3>
                    <p><span>${total}</span> annonces</p>
               </div>
          `;
          ptrGrid.insertAdjacentHTML("beforeend", fiche);
     });
}

/**
 * =======================================================
 *  @function     initEventRecherche
 *  @description  Gestionnaire d'événements sur la grille de catégories
 * =======================================================
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
          if (!card) { return; }
          const tmp = annoncesInfo.find(tmp => tmp.annonce_id == card.dataset.annonceid);

          localStorage.setItem("annonceInfo", JSON.stringify(tmp));
          window.location.href = `/html/details.html`;
     });
}

/**
 * =======================================================
 *  @function     initEventRecherche
 *  @description  Gestion de la recherche d'annonces
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

          await chargerAnnonces(limite, category, keyword);
          await afficheAnnonces();
          showTitleCategorie(category);
          initEventAnnonce();
     });
}

/**
 * =======================================================
 *  @function     showTitleCategorie
 *  @description  Met à jour le titre de la section
 *                "Derniers ajouts" selon la catégorie choisie
 * =======================================================
 */
function showTitleCategorie(categorie) {
     const categories = JSON.parse(localStorage.getItem('categories')) || [];
     const ptrTitleCategorie = document.getElementById("section-title-categorie");

     if (categorie > 0) {
          ptrTitleCategorie.textContent = `${TAB_ICON[categorie - 1]}${categories[categorie - 1].nom}`;
     } else {
          ptrTitleCategorie.textContent = `Toutes les catégories`;
     }
}
