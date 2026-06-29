//===========================================================
//    FICHIER : mesannonces.js
//    PROJET  : ccmarket
//    DATE    : 17/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
import { afficheModale } from "/js/tools/modale.js";
import { boiteDialogue } from "/js/tools/boiteDialogue.js";
import { logError } from "/js/tools/logger.js";

verifierConnection();

const container = document.getElementById("annonces_body");
const userinfo = JSON.parse(localStorage.getItem("userinfo") || "null");
if (!userinfo) window.location.href = "index.html";

chargerAnnonces();
afficheAnnonces();
afficheModale();
document.addEventListener("DOMContentLoaded", async () => {
    const formPublier = document.querySelector("form");

    document.getElementById('inputphoto').addEventListener('change', (e) => {

            const fichier = e.target.files[0];
            document.getElementById('file-nom').textContent = fichier
                ? fichier.name
                : 'Aucun fichier choisi';
        });
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
            window.location.href = "mesannonces.html";
            } else {
            const errData = await res.json();
            alert(`Erreur lors de la publication : ${errData.message || 'Erreur inconnue'}`);
            }
        } catch (error) {
            logError(error, "dans le module:mesannonces.js");
            console.error("Erreur lors de l'envoi :", error);
        }
        });
    }
});
/**
 * =======================================================
 *  @function     chargerAnnonces
 *  @description  Description de la fonction
 * =======================================================
 *
 */
async function chargerAnnonces() {
    try {
        const response = await fetch(`/api/annonces/mesannonces/${userinfo.id}`);
        const annonces = await response.json();

        if (annonces && annonces.length > 0) {
            localStorage.setItem("userannonces", JSON.stringify(annonces));
        }
    } catch (error) {
        logError(error, "FONCTION: chargerAnnonces, MODULE: mesannonces.js");
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color:red;">
                    Impossible de charger les annonces.
                </td>
            </tr>`;
    }
}
/**
 * =======================================================
 *  @function     afficherAnnonces
 *  @description  Description de la fonction
 * =======================================================
 *
 */
function afficheAnnonces() {
    const annonces = JSON.parse(localStorage.getItem("userannonces"));
    if (!annonces || annonces.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:2rem;">
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
                            <a href="#">
                                <button type="button" data-id="${annonce.annonce_id}" class="btn_modifier" id="btn_modifier_${annonce.annonce_id}">Modifier</button>
                            </a>
                            <a href="#">
                                <button data-id="${annonce.annonce_id}" "type="button" class="btn_supprimer" id="btn_supprimer_${annonce.annonce_id}">Supprimer</button>
                            </a>
                        </td>
                    </tr>
            `;
            container.insertAdjacentHTML("beforeend", fiche);
        });

        const dialog = document.getElementById("ma_boite_dialogue");
        annonces.forEach((annonce) => {
            document.getElementById(`btn_supprimer_${annonce.annonce_id}`)
                .addEventListener("click", (e) => {
                    const id = e.target.dataset.id;
                    dialog.showModal();
                    boiteDialogue(dialog, id);
                });
        });
 }
