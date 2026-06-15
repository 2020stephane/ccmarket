//===========================================================
//    FICHIER : index.js
//    PROJET  : ccmarket
//    DATE    : 02/03/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { ajoutBouttonCompte, verifierConnection} from "/js/tools/authentification.js";

let annonces_info = [];
ajoutBouttonCompte();
verifierConnection();
chargerAnnonces();
// ==================================================
// Fonction chargerAnnonces
// ==================================================
async function chargerAnnonces() {
   try {
      const response = await fetch("/api/derniers_ajouts",);
    //   if (!response.ok) throw new Error("Erreur réseau");
      const tmp = await response.json();
      localStorage.setItem("annonces", JSON.stringify(tmp));
      annonces_info.length = 0;
      tmp.forEach(item => annonces_info.push(item));
      afficheAnnonces();
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
function afficheAnnonces() {
   const pGrid = document.querySelector(".annonces-grid");
   if (annonces_info.length === 0) {
      pGrid.innerHTML = "<li>Aucune annonce pour le moment.</li>";
      return;
    }
    pGrid.innerHTML = "";
    annonces_info.forEach((annonce) => {
      const imagePath = annonce.photos
        ? `/uploads/${annonce.photos}`
        : "/uploads/default.png";
      const datePub = new Date(annonce.date_publication);
      const nomVendeur = annonce?.nom ?? "Vendeur inconnu";
      const fiche = `
                <li>
                    <article>
                        <figure>
                            <img src="/uploads/default.png" alt="${annonce.titre}" loading="lazy">
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
                                <p class="vendeur">Vendeur : ${nomVendeur}</p>
                                <button type="button" class="btn-contact">Contacter le vendeur</button>
                            </footer>
                        </div>
                    </article>
                </li>
            `;
      pGrid.insertAdjacentHTML("beforeend", fiche);
    });
}
