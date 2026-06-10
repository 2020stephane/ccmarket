//===========================================================
//    FICHIER : index.js
//    PROJET  : ccmarket
//    DATE    : 02/03/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import {annonces_info} from "./data/annoncesAll.js";
console.log("an_info= ",annonces_info);
let userInfo = [];
localStorage.getItem("annonces")
 ? JSON.parse(localStorage.getItem("annonces")).forEach((item) => annonces_info.push(item))
 : localStorage.setItem("annonces", JSON.stringify(annonces_info));
localStorage.getItem("userinfo")
 ? Object.values(JSON.parse(localStorage.getItem("userinfo"))).forEach((item) => userInfo.push(item))
 : localStorage.setItem("userinfo", JSON.stringify(userInfo));
console.log(userInfo);
sauveAnnonces();
afficheAnnonces();
// ==================================================
// Fonction sauveAnnonces
// ==================================================
async function sauveAnnonces() {
   try {
      const response = await fetch("/api/derniers_ajouts",);
      if (!response.ok) throw new Error("Erreur réseau");
      const tmp = await response.json();
      localStorage.setItem("annonces", JSON.stringify(tmp));
   } catch (error) {
      console.log("message : ", error.message);
      console.log("nom : ", error.name);
      console.log("stack : ", error.stack);
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
      const imagePath = annonce.image_nom
        ? `/uploads/${annonce.image_nom}`
        : "/uploads/default.png";
      const datePub = new Date(annonce.date_publication);
      const fiche = `
                <li>
                    <article>
                        <figure>
                            <img src="${imagePath}" alt="${annonce.titre}" loading="lazy">
                        </figure>
                    
                        <div class="annonce_content">
                            <h3>${annonce.titre}</h3>
                            
                            <p class="annonce_description">
                               ${annonce.description}
                            </p>
                            <p class="annonce_price">
                               ${parseFloat(annonce.prix).toLocaleString("fr-FR")} €
                            </p>
                            
                            <p class="annonce_date">
                                Publié le : <time datetime="${datePub.toISOString()}">${datePub.toLocaleDateString()}</time>
                            </p>
                            
                            <footer class="annonce_footer">
                                <p class="vendeur">Vendeur : ${userInfo[2]}</p>
                                <button type="button" class="btn-contact">Contacter le vendeur</button>
                            </footer>
                        </div>
                    </article>
                </li>
            `;
      pGrid.insertAdjacentHTML("beforeend", fiche);
    });
}
