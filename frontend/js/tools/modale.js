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

export function afficheModale() {

    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close-modal');
    const formEdit = document.getElementById('formmodifier');
    let id = 0;
    const tabAnnonces = JSON.parse(localStorage.getItem("userannonces"));
    let monAnnonce = [];

    document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn_modifier')) {
        e.preventDefault();
        id = Number(e.target.getAttribute('data-id'));
        monAnnonce = tabAnnonces.find(tmp => tmp.annonce_id == id);
        modal.style.display = 'flex';

        document.getElementById('editTitre').value = monAnnonce.titre;
        document.getElementById('editPrix').value = monAnnonce.prix;
        document.getElementById('editDescriptif').value = monAnnonce.descriptif;
    }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    if (formEdit) {
    const formClone = formEdit.cloneNode(true);
    formEdit.parentNode.replaceChild(formClone, formEdit);
        formClone.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updatedData = {
                titre: document.getElementById('editTitre').value,
                prix: document.getElementById('editPrix').value,
                descriptif: document.getElementById('editDescriptif').value,
                categorie_id: document.getElementById('editCategorie').value
            };

            try {
                const response = await fetch(`/api/annonces/modifierannonce/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    // alert('Annonce mise à jour avec succès !');
                    modal.style.display = 'none';
                    window.location.reload();
                } else {
                    console.error('Erreur lors de la modification. :', error);
                }
            } catch (error) {
                console.error('Erreur réseau :', error);
                logError(error, "FONCTION: afficheModale, MODULE:modale.js");
            }
        });
    }
}

