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

/**
 * =======================================================
 * IMPORTS
 * =======================================================
*/
import { verifierConnection } from "/js/tools/authentification.js";
/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
verifierConnection();
chargerAnnonces();
/**
 * =======================================================
 * Déclarations des fonctions
 * =======================================================
 */
/**
 * =========================================
 *  Fonction : chargerAnnonces
 *  Récupère les dernières annonces depuis l'API.
 *  Stocke les données dans le localStorage, met à jour le tableau local
 *  et déclenche l'affichage dans le DOM. En cas d'erreur, affiche un message dédié.
 * *@async
 *  @function chargerAnnonces
 *  @returns {Promise<void>}
 * =========================================
 */
async function chargerAnnonces() {
    let annonces_info = [];
   try {
      const response = await fetch("/api/annonces/derniers_ajouts",);
      const tmp = await response.json();
      localStorage.setItem("annonces", JSON.stringify(tmp));
      annonces_info.length = 0;
      tmp.forEach(item => annonces_info.push(item));
      afficheAnnonces(annonces_info);
   } catch {
      const pGrid = document.querySelector(".annonces-grid");
      pGrid.innerHTML = "<li>Impossible de charger les annonces.</li>";
   }
}
/**===============================================================
 *  Fonction afficheAnnonces
 *  ==================================================
 * Génère le code HTML et affiche la liste des annonces dans le DOM.
 * * @function afficheAnnonces
 * @param {Object[]} annonces_info - Liste des objets "Annonce" à afficher.
 * @param {string} annonces_info[].titre - Titre de l'annonce.
 * @param {string} annonces_info[].descriptif - Description détaillée.
 * @param {number|string} annonces_info[].prix - Prix du bien.
 * @param {string} annonces_info[].date_publication - Chaîne de caractères de la date (format ISO ou compatible).
 * @param {number} annonces_info[].utilisateur_id - Identifiant du vendeur.
 * @param {string[]} annonces_info[].photos - Tableau contenant les noms des fichiers image associés.
 * @param {string} [annonces_info[].nom] - Nom optionnel du vendeur.
 * @returns {void}
 */
function afficheAnnonces(annonces_info) {
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
      const nomVendeur = annonce?.nom ?? "Vendeur inconnu";
      const fiche = `
                <li>
                    <article>
                        <figure>
                            <img src="${imageNom}" alt="${annonce.titre}" loading="lazy">
                        </figure>

                        <div class="annonce_content">
                            <h3>${annonce.titre}</h3>

                            <p class="annonce_description">
                               ${annonce.descriptif}
                            </p>
                            <p class="annonce_price">
                               ${parseFloat(annonce.prix).toLocaleString("fr-FR")} €
                            </p>

                            <p class="annonce_date">
                                Publié le : <time datetime="${datePub.toISOString()}">${datePub.toLocaleDateString()}</time>
                            </p>

                            <footer class="annonce_footer">
                                <p class="vendeur">Vendeur : ${annonce.utilisateur_id}</p>
                                <button type="button" class="btn-contact">Contacter le vendeur</button>
                            </footer>
                        </div>
                    </article>
                </li>
            `;
      pGrid.insertAdjacentHTML("beforeend", fiche);
    });
}
