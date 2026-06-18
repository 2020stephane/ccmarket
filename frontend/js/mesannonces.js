//===========================================================
//    FICHIER : mesannonces.js
//    PROJET  : ccmarket
//    DATE    : 17/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
verifierConnection();

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".annonces_grid");

  try {
    const userid = (JSON.parse(localStorage.getItem('userinfo'))).id;
    const response = await fetch(`/api/annonces/mesannonces/${userid}`);
    const annonces = await response.json();

    if (annonces.length === 0) {
      container.innerHTML = "<li>Aucune annonce pour le moment.</li>";
      return;
    }
    container.innerHTML = "";

    annonces.forEach((annonce) => {
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
                           <h2>Titre:</h2>
                            <h3>${annonce.titre}</h3>
                           <h2>Description:</h2>
                            <p class="annonce_description">
                              ${annonce.descriptif}
                            </p>
                            <h2>Prix:</h2>
                            <p class="annonce_price">
                               ${parseFloat(annonce.prix).toLocaleString("fr-FR")} €
                            </p>

                            <p class="annonce_date">
                                Publié le : <time datetime="${datePub.toISOString()}">${datePub.toLocaleDateString()}</time>
                            </p>

                            <footer class="annonce_footer">
                                 <a href="modifier_annonce.html?id=${annonce.annonceid}">
                                 <button type="button" class="btn_modifier">Modifier l'annonce</button>
                                 </a>
                            </footer>
                        </div>
                    </article>
                </li>

            `;
      container.insertAdjacentHTML("beforeend", fiche);
     });
  } catch (error) {
    console.error("Impossible de charger les annonces :", error);
    container.innerHTML = "<li>Impossible de charger les annonces.</li>";
  }
});
