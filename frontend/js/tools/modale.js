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
export function afficheModale() {

    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close-modal');
    const formEdit = document.getElementById('formEditAnnonce');
    const tabAnnonces = JSON.parse(localStorage.getItem("userannonces"));
    const monAnnonce = [];

    document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn_modifier')) {
        e.preventDefault();
        const id = Number(e.target.getAttribute('data-id'));
        monAnnonce = tabAnnonces.find(tmp => tmp.annonce_id == id);
        modal.style.display = 'flex';
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
        formEdit.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('editId').value;
            const updatedData = {
                titre: document.getElementById('editTitre').value,
                prix: document.getElementById('editPrix').value,
                description: document.getElementById('editDescription').value
            };

            try {
                const response = await fetch(`/annonces/update/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    alert('Annonce mise à jour avec succès !');
                    modal.style.display = 'none';
                    window.location.reload(); // Recharge la page pour afficher les changements
                } else {
                    alert('Erreur lors de la modification.');
                }
            } catch (error) {
                console.error('Erreur réseau :', error);
            }
        });
    }
}

