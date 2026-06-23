//===========================================================
//    FICHIER : mesannonces.js
//    PROJET  : ccmarket
//    DATE    : 17/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
import { boiteDialogue } from "/js/tools/boiteDialogue.js";

verifierConnection();

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("annonces_body");
    const formPublier = document.querySelector("form");
    try {
        const userinfo = localStorage.getItem('userinfo');
        if (!userinfo) return;

        const userid = JSON.parse(userinfo).id;
        const response = await fetch(`/api/annonces/mesannonces/${userid}`);
        const annonces = await response.json();
console.log("annonces = ", annonces)
        if (!annonces || annonces.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:2rem;">
                        Aucune annonce pour le moment.
                    </td>
                </tr>`;
        return;
        }
        container.innerHTML = "";

        annonces.forEach((annonce) => {
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
                        <td class="col_categorie"><strong>${annonce.categorie[0].nom}</strong></td>
                        <td class="col_date"><time datetime="${datePub.toISOString()}">${datePub.toLocaleDateString()}</time></td>
                        <td class="col_action">
                            <a href="modifierAnnonce.html?id=${annonce.annonce_id}">
                                <button type="button" class="btn_modifier">Modifier</button>
                            </a>
                            <a href="#">
                                <button data-id="${annonce.annonce_id}" "type="button" id="btn_supprimer_${annonce.annonce_id}">Supprimer</button>
                            </a>
                        </td>
                    </tr>
            `;
            container.insertAdjacentHTML("beforeend", fiche);

        });
        annonces.forEach((annonce) => {
            const dialog = document.getElementById("ma_boite_dialogue");
            const temp = document.getElementById(`btn_supprimer_${annonce.annonce_id}`);
            temp.addEventListener("click", (event) => {
                 const id = event.target.dataset.id;
                 dialog.showModal();
                 boiteDialogue(dialog, id);
            });
        });
    } catch (error) {
       console.error("Impossible de charger les annonces :", error);
       container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Impossible de charger les annonces.</td></tr>`;
    }

    if (formPublier) {
        formPublier.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(formPublier);

        const userinfo = JSON.parse(localStorage.getItem('userinfo'));
        if (userinfo && userinfo.id) {
            formData.append("utilisateur_id", userinfo.id);
        }
    try {
            const res = await fetch("/api/annonces/publierannonce", {
            method: "POST",
            body: formData
            });

            if (res.ok) {
            alert("Annonce publiée avec succès !");
            window.location.reload();
            } else {
            const errData = await res.json();
            alert(`Erreur lors de la publication : ${errData.message || 'Erreur inconnue'}`);
            }
        } catch (err) {
            console.error("Erreur lors de l'envoi :", err);
            alert("Impossible de joindre le serveur.");
        }
        });
    }
});
