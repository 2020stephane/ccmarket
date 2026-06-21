//===========================================================
//    FICHIER : modifierAnnonce.js
//    PROJET  : ccmarket
//    DATE    : 21/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
verifierConnection();

document.addEventListener("DOMContentLoaded", async () => {
     const container = document.getElementById("annonces_body");
     const queryParams = new URLSearchParams(window.location.search);
     const idAnnonce = queryParams.get("id");

     if (!idAnnonce) {
          container.innerHTML = `
          <tr>
               <td colspan="6" style="text-align:center; color:red;">
                    Impossible de charger l'annonce.
               </td>
          </tr>`;
          return;
    }
     try {
        const response = await fetch(`/api/annonces/${idAnnonce}`);
        const annonce = await response.json();
        container.innerHTML = "";

        if (annonce) {
        const aDesPhotos = annonce.photos && annonce.photos.length > 0;
        const imagePath = aDesPhotos
            ? `/uploads/${annonce.photos[0].photo_url}`
            : '/uploads/default.png';
        const datePub = new Date(annonce.date_publication);
        const fiche = `
                <tr>
                    <td class="col_photo">
                        <img src="${imagePath}" alt="${annonce.titre}" loading="lazy">
                    </td>
                    <td class="col_titre"><strong>${annonce.titre}</strong></td>
                    <td class="col_desc_cell">
                        <div class="scroll_desc">${annonce.descriptif}</div>
                    </td>
                    <td class="col_prix">${parseFloat(annonce.prix).toLocaleString("fr-FR")} €</td>
                    <td class="col_date"><time datetime="${datePub.toISOString()}">${datePub.toLocaleDateString()}</time></td>
                </tr>
        `;
        container.insertAdjacentHTML("beforeend", fiche);
        };
     } catch (error) {
        console.error("Impossible de charger l'annonce :", error);
       container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Impossible de charger l'annonce.</td></tr>`;
    }
});
