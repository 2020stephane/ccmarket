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

// Vérifie la connexion et récupère les infos utilisateur (dont l'id) depuis le serveur
const data = await verifierConnection();

const container = document.getElementById("annonces_body");

init();

async function init() {
   await chargerAnnonces(data.id);
   afficheAnnonces();
   afficheModale();
}

/**
 * =======================================================
 *  @function     chargerAnnonces
 *  @description  Charge les annonces de l'utilisateur connecté.
 *  @param {number} idUtilisateur - Identifiant de l'utilisateur connecté.
 *  @async
 * =======================================================
 */
async function chargerAnnonces(idUtilisateur) {
    try {
        const response = await fetch(`/api/annonces/mesannonces/${idUtilisateur}`, {
            credentials: "include"
        });
        const annonces = await response.json();

        if (annonces && annonces.length > 0) {
            localStorage.setItem("userannonces", JSON.stringify(annonces));
        } else {
            localStorage.removeItem("userannonces");
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
 *  @function     afficheAnnonces
 *  @description  Affiche la liste des annonces de l'utilisateur
 * =======================================================
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
                            <button data-id="${annonce.annonce_id}" type="button" class="btn_supprimer" id="btn_supprimer_${annonce.annonce_id}">Supprimer</button>
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
