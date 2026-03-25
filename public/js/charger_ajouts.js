// fonction en js
document.addEventListener("DOMContentLoaded", async () => {
  const liste = document.querySelector(".produits-grid");

  try {
    const response = await fetch(
      "/api/derniers-ajouts",
    );

    if (!response.ok) throw new Error("Erreur réseau");

    const annonces = await response.json();

    if (annonces.length === 0) {
      liste.innerHTML = "<li>Aucune annonce pour le moment.</li>";
      return;
    }
    const container = document.querySelector(".produits-grid");
    container.innerHTML = "";

    annonces.forEach((annonce) => {
      const imagePath = annonce.image_nom
        ? `../uploads/${annonce.image_nom}`
        : "../uploads/default.png";
      const datePub = new Date(annonce.date_publication);

      const card = `
                <li>
                    <article>
                        <figure>
                            <img src="${imagePath}" alt="${annonce.titre}" loading="lazy">
                        </figure>
                    
                        <div class="produit-content">
                            <h3>${annonce.titre}</h3>
                            
                            <p class="produit-price">
                               ${parseFloat(annonce.prix).toLocaleString("fr-FR")} €
                            </p>
                            
                            <p class="produit-date">
                                Publié le : <time datetime="${datePub.toISOString()}">${datePub.toLocaleDateString()}</time>
                            </p>
                            
                            <footer class="produit-footer">
                                <p class="vendeur">Vendeur : ${annonce.nom}</p>
                                <button type="button" class="btn-contact">Contacter le vendeur</button>
                            </footer>
                        </div>
                    </article>
                </li>
            `;
      container.insertAdjacentHTML("beforeend", card);
    });
  } catch (error) {
    console.error("Impossible de charger les annonces :", error);
    liste.innerHTML = "<li>Impossible de charger les annonces.</li>";
  }
});
