//===========================================================
//    FICHIER : index.js
//    PROJET  : ccmarket
//    DATE    : 02/03/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
//***********************************************
//import { ajouts } from "/js/data/objectTest.js";
//***********************************************
verifierConnection();
//commenter pour utiliser ajouts
chargerAnnonces();
// ==================================================
// Fonction chargerAnnonces
// ==================================================
async function chargerAnnonces() {
    let annonces_info = [];
   try {
      const response = await fetch("/api/annonces/derniers_ajouts",);
      const tmp = await response.json();
      localStorage.setItem("annonces", JSON.stringify(tmp));
      annonces_info.length = 0;
      tmp.forEach(item => annonces_info.push(item));
      afficheAnnonces(annonces_info);
   } catch (error) {
      console.log("message : ", error.message);
      console.log("nom : ", error.name);
      console.log("stack : ", error.stack);
      const pGrid = document.querySelector(".annonces-grid");
      pGrid.innerHTML = "<li>Impossible de charger les annonces.</li>";
   }
}
// ==================================================
// Fonction afficheAnnonces
// ==================================================
function afficheAnnonces(annonces_info) {
   const pGrid = document.querySelector(".annonces-grid");
   if (annonces_info.length === 0) {
      pGrid.innerHTML = "<li>Aucune annonce pour le moment.</li>";
      return;
    }
    pGrid.innerHTML = "";
    annonces_info.forEach((annonce) => {
      const imagePath = annonce.photos?.[0] ?? "/uploads/default.png";
      const datePub = new Date(annonce.date_publication);
      const nomVendeur = annonce?.nom ?? "Vendeur inconnu";
      const fiche = `
                <li>
                    <article>
                        <figure>
                            <img src="${imagePath}" alt="${annonce.titre}" loading="lazy">
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
