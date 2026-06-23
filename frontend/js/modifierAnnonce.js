//===========================================================
//    FICHIER : modifierAnnonce.js
//    PROJET  : ccmarket
//    DATE    : 21/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
verifierConnection();

document.addEventListener("DOMContentLoaded", async () => {
     const container = document.getElementById("formContainer");
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
console.log("annonce = ", annonce);
        container.innerHTML = "";

        if (annonce) {
        const aDesPhotos = annonce.photos && annonce.photos.length > 0;
        const imagePath = aDesPhotos
            ? `/uploads/${annonce.photos[0].photo_url}`
            : '/uploads/default.png';
        const datePub = new Date(annonce.date_publication);
        const fiche = `
            <p class="form_group">
               <label for="titre">Titre de l'annonce :</label>
               <input type="text" name="titre" id="titre" maxlength="50"
                placeholder="Ex: Panneau solaire 200W" value="${annonce.titre}" required>
            </p>

            <p class="form_group">
               <label for="categorie">Catégorie :</label>
               <input type="number" name="categorie" id="categorie"
                placeholder="ID de la catégorie" value="${annonce.categorie_id}" required>
            </p>

            <p class="form_group">
               <label for="prix">Prix (€) :</label>
               <input type="number" step="0.01" name="prix" id="prix" min="0" max="999999"
                placeholder="Prix en €" value="${annonce.prix}" required>
            </p>

            <p class="form_group">
               <label for="descriptif">Description :</label>
               <textarea name="descriptif" id="descriptif" rows="5" maxlength="1000"
                placeholder="Décrivez votre produit en détail..." required>${annonce.descriptif}</textarea>
            </p>

            <p class="form_group">
                <label for="photo">Photo :</label>
                <div class="photo_group">
                    <img src="${imagePath}" alt="${annonce.titre}">
                    <input type="file" id="photo" name="photo" accept="image/*">
                </div>
            </p>

            <p class="btn_group">
                <button type="button" class="btn_sauver">Sauver</button>
                <button type="button" class="btn_annuler">Annuler</button>
            </p>
        `;
        container.insertAdjacentHTML("beforeend", fiche);

        };
     } catch (error) {
        console.error("Impossible de charger l'annonce :", error);
       container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Impossible de charger l'annonce.</td></tr>`;
    }
});
