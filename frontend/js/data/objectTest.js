//===========================================================
//    FICHIER : objectTest.js
//    PROJET  : ccmarket
//    DATE    : 28/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
let annonces = [
   {
   categorie : "accessoire",
   image : "../img/test/supporttv.webp",
   titre : "support_tv",
   description : "un support pour tv",
   prix : 65,
   datePublication : "24-04-2026",
   nomVendeur: "brisse"
   },
   {
   categorie : "electricite",
   image : "../img/test/pompe.webp",
   titre : "pompe à eau",
   description : "pompe 12v",
   prix : 45,
   datePublication : "21-04-2026",
   nomVendeur: "toto"},
   {
   categorie : "electricite",
   image : "../img/test/victron.webp",
   titre : "convertisseur",
   description : "convertisseur victron 250w",
   prix : 45,
   datePublication : "24-04-2026",
   nomVendeur: "titi"}
]

function ajouts() {
   const pGrid = document.querySelector(".annonces-grid");
   pGrid.innerHTML = "";

    annonces.forEach((annonce) => {
        const fiche = `
                <li>
                    <article>
                        <figure>
                            <img src="${annonce.image}" alt="${annonce.titre}" loading="lazy">
                        </figure>
                        <div class="annonce_content">
                            <h3>${annonce.titre}</h3>

                            <p class="annonce_description">
                               ${annonce.description}
                            </p>
                            <p class="annonce_price">
                               ${annonce.prix} euros
                            </p>

                            <footer class="annonce_footer">
                                <p class="vendeur">Vendeur : ${annonce.nomVendeur}</p>
                                <button type="button" class="btn-contact">Contacter le vendeur</button>
                            </footer>
                        </div>
                    </article>
                </li>
            `;
      pGrid.insertAdjacentHTML("beforeend", fiche);
    });
}
ajouts();
