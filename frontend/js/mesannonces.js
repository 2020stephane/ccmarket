//===========================================================
//    FICHIER : mesannonces.js
//    PROJET  : ccmarket
//    DATE    : 17/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================

import { verifierConnection } from "/js/tools/authentification.js";
import { boiteDialogue } from "/js/tools/boiteDialogue.js";
import { logError } from "/js/tools/logger.js";

/**
 * =======================================================
 *  Constantes partagées
 * =======================================================
 */
const container = document.getElementById("annonces_body");

/**
 * Correction sécurité (XSS) : échappe tout contenu utilisateur avant de
 * l'injecter en HTML (titre, description, nom de catégorie...). Sans ça,
 * une annonce contenant du HTML/JS (ex: <img src=x onerror=...>) dans son
 * titre ou sa description serait exécutée pour quiconque consulte la liste.
 * NB : idéalement à extraire dans un module utilitaire partagé
 * (ex: /js/tools/echapperHTML.js) et à réutiliser sur messages.js.
 */
function echapperHTML(texte) {
    const div = document.createElement('div');
    div.textContent = texte ?? '';
    return div.innerHTML;
}

/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
try {
     const data = await verifierConnection();

     /** ===== MODEL ===== */
     await chargerAnnonces(data.id);

     /** ===== VIEW =====*/
     await afficheAnnonces();

     /** ===== CONTROLLERS ===== */
     initBtn();

} catch (error) {
     logError(error,"Script principal, MODULE:mesannonces.js");
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
            ? `/uploads/${echapperHTML(annonce.photos[0].photo_url)}`
            : '/uploads/default.png';
        const datePub = new Date(annonce.date_publication);
        const fiche = `
                <tr>
                    <td class="col_photo">
                        <img src="${imagePath}" alt="${echapperHTML(annonce.titre)}" loading="lazy">
                    </td>
                    <td class="col_titre"><strong>${echapperHTML(annonce.titre)}</strong></td>
                    <td class="col_desc_cell">
                        <div class="scroll_desc">${echapperHTML(annonce.descriptif)}</div>
                    </td>
                    <td class="col_prix">${parseFloat(annonce.prix).toLocaleString("fr-FR")} €</td>
                    <td class="col_categorie"><strong>${echapperHTML(annonce.categorie[0].nom)}</strong></td>
                    <td class="col_date"><time datetime="${datePub.toISOString()}">${datePub.toLocaleDateString()}</time></td>
                    <td class="col_action">
                        <button type="button" data-id="${annonce.annonce_id}" class="btn_modifier" id="btn_modifier_${annonce.annonce_id}">Modifier</button>
                        <button data-id="${annonce.annonce_id}" type="button" class="btn_supprimer" id="btn_supprimer_${annonce.annonce_id}">Supprimer</button>
                    </td>
                </tr>
        `;
        container.insertAdjacentHTML("beforeend", fiche);
    });


}
/**
 * =======================================================
 *  @function     afficheModale
 *  @description  Affiche la fenetre pour modifier une annonce
 *  @param {id}   Identifiant de l'annonce
 * =======================================================
 */
function afficheModale(id) {
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close-modal');
    const formEdit = document.getElementById('formmodifier');

    const tabAnnonces = JSON.parse(localStorage.getItem("userannonces")) || [];
    const monAnnonce = tabAnnonces.find(tmp => tmp.annonce_id == id);

    if (!monAnnonce) return;

    document.getElementById('editTitre').value = monAnnonce.titre;
    document.getElementById('editCategorie').value = monAnnonce.categorie_id; // ✅ Ajouté !
    document.getElementById('editPrix').value = monAnnonce.prix;
    document.getElementById('editDescriptif').value = monAnnonce.descriptif;

    modal.style.display = 'flex';

    const fermerModale = () => { modal.style.display = 'none'; };
    if (closeBtn) closeBtn.onclick = fermerModale;

    window.onclick = (e) => {
        if (e.target === modal) fermerModale();
    };

    const formClone = formEdit.cloneNode(true);
    formEdit.parentNode.replaceChild(formClone, formEdit);

    const btnAnnuler = formClone.querySelector('#btnM_annuler');
    if (btnAnnuler) btnAnnuler.onclick = fermerModale;

    const inputPhoto = formClone.querySelector('#inputphoto');
    const fileNom = formClone.querySelector('#file-nom');
    if (inputPhoto && fileNom) {
        inputPhoto.addEventListener('change', () => {
            fileNom.textContent = inputPhoto.files[0] ? inputPhoto.files[0].name : 'Aucun fichier choisi';
        });
    }

    formClone.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(formClone);

        try {
            const response = await fetch(`/api/annonces/modifierannonce/${id}`, {
                method: 'PATCH',
                body: formData
            });

            if (response.ok) {
                fermerModale();
                window.location.reload();
            } else {
                const errData = await response.json();
                console.error('Erreur serveur :', errData);
            }
        } catch (error) {
            console.error('Erreur réseau :', error);
            logError(error, "FONCTION: afficheModale, MODULE:mesannonces.js");

        }
    });
}
/**
 * =======================================================
 *  @function     initBtn
 *  @description  Initialise les listeners
  * =======================================================
 */
function initBtn() {
     const annonces = JSON.parse(localStorage.getItem("userannonces"));
     const dialog = document.getElementById("ma_boite_dialogue");

     // Correction : si l'utilisateur n'a aucune annonce, chargerAnnonces()
     // fait localStorage.removeItem("userannonces") -> annonces vaut null
     // ici, et annonces.forEach() plantait avec une erreur JS.
     if (!annonces || annonces.length === 0) return;

     annonces.forEach((annonce) => {
          document.getElementById(`btn_supprimer_${annonce.annonce_id}`)
               .addEventListener("click", (e) => {
                    const id = e.target.dataset.id;
                    dialog.showModal();
                    boiteDialogue(dialog, id);
               });
     });
     annonces.forEach((annonce) => {
          document.getElementById(`btn_modifier_${annonce.annonce_id}`)
               .addEventListener("click", (e) => {
                    const id = e.target.dataset.id;
                    afficheModale(id);
               });
     });
}
