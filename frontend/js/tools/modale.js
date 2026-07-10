/**
 * =======================================================
 *  @fileoverview  modale.js
 *  @project       ccmarket
 *  @description   gestion de la fenetre modale
 *  @version       1.0.0
 *  @date          2026-06-28
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
import { logError } from "/js/tools/logger.js";

export function afficheModale(id) {
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close-modal');
    const btnAnnuler = document.getElementById('btn_annuler');
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
                // ⚠️ Ne PAS mettre 'Content-Type': 'application/json' avec FormData !
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
            if (typeof logError === "function") {
                logError(error, "FONCTION: afficheModale, MODULE:modale.js");
            }
        }
    });
}
