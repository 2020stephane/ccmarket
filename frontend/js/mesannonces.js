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
    const btnAnnuler = document.getElementById('btnannuler');
    const formEdit = document.getElementById('formmodifier');

    const tabAnnonces = JSON.parse(localStorage.getItem("userannonces")) || [];
    const monAnnonce = tabAnnonces.find(tmp => tmp.annonce_id == id);

    if (!monAnnonce) return;

    // 1. Pré-remplissage des champs
    document.getElementById('editTitre').value = monAnnonce.titre;
    document.getElementById('editCategorie').value = monAnnonce.categorie_id; // ✅ Ajouté !
    document.getElementById('editPrix').value = monAnnonce.prix;
    document.getElementById('editDescriptif').value = monAnnonce.descriptif;

    // 2. Affichage
    modal.style.display = 'flex';

    // 3. Gestion de la fermeture
    const fermerModale = () => { modal.style.display = 'none'; };
    if (closeBtn) closeBtn.onclick = fermerModale;
    if (btnAnnuler) btnAnnuler.onclick = fermerModale;

    window.onclick = (e) => {
        if (e.target === modal) fermerModale();
    };

    // 4. Clonage propre du formulaire pour purger les évenements
    const formClone = formEdit.cloneNode(true);
    formEdit.parentNode.replaceChild(formClone, formEdit);

    // 5. Gestion du bouton "Choisir une photo" pour afficher le nom du fichier sélectionné
    const inputPhoto = formClone.querySelector('#inputphoto');
    const fileNom = formClone.querySelector('#file-nom');
    if (inputPhoto && fileNom) {
        inputPhoto.addEventListener('change', () => {
            fileNom.textContent = inputPhoto.files[0] ? inputPhoto.files[0].name : 'Aucun fichier choisi';
        });
    }

    // 6. Soumission
    formClone.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Utilisation de FormData pour gérer le texte ET le fichier photo
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
