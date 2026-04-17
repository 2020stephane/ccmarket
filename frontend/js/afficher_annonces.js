//===========================================================
//    FICHIER : afficher_annonces.js
//    PROJET  : ccmarket
//    DATE    : 17/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".annonces-grid");

  try {
    const response = await fetch("/api/mesannonces",);

    if (!response.ok) throw new Error("Erreur réseau");

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
                                 <button type="button" class="btn-contact">Modifier l'annonce</button>
                            </footer>
                        </div>
                    </article>
                </li>
            `;
      container.insertAdjacentHTML("beforeend", fiche);
    });
  } catch (error) {
    console.error("Impossible de charger les annonces :", error);
    liste.innerHTML = "<li>Impossible de charger les annonces.</li>";
  }
});
