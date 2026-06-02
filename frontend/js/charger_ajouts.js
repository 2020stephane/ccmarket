//===========================================================
//    FICHIER : charger_ajouts.js
//    PROJET  : ccmarket
//    DATE    : 02/03/2026
//    AUTEUR  : Stephane Brisse
//===========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const pGrid = document.querySelector(".annonces-grid");

  try {
    const response = await fetch("/api/derniers_ajouts",);
    if (!response.ok) throw new Error("Erreur réseau");
    const annonces = await response.json();
    if (annonces.length === 0) {
      pGrid.innerHTML = "<li>Aucune annonce pour le moment.</li>";
      return;
    }
    pGrid.innerHTML = "";
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
                                <p class="vendeur">Vendeur : ${annonce.nom}</p>
                                <button type="button" class="btn-contact">Contacter le vendeur</button>
                            </footer>
                        </div>
                    </article>
                </li>
            `;
      pGrid.insertAdjacentHTML("beforeend", fiche);
    });
  } catch (error) {
    console.log("message : ", error.message);
    console.log("nom : ", error.name);
    console.log("stack : ", error.stack);
    pGrid.innerHTML = "<li>Impossible de charger les annonces.</li>";
  }
});
