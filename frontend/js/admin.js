/**
 * =======================================================
 *  @fileoverview  admin.js
 *  @project       ccmarket
 *  @description   Module pour administrer le site
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */



deconnexion();
await chargerStat();
const stat = JSON.parse(localStorage.getItem('statAdmin'));
afficherStat();

function afficherStat() {
     document.getElementById("totalUtilisateurs").textContent = stat.compteurs.nb_utilisateurs;
     document.getElementById("totalAnnonces").textContent = stat.compteurs.nb_annonces;
     document.getElementById("totalMessages").textContent = stat.compteurs.nb_messages;
     document.getElementById("totalCategories").textContent = stat.compteurs.nb_categories;
     document.getElementById("totalAvatars").textContent = stat.compteurs.nb_avatars;
     document.getElementById("totalContacts").textContent = stat.compteurs.nb_contacts;
     document.getElementById("totalPhotos").textContent = stat.compteurs.nb_photos;
}
async function chargerStat() {
   try {
     const response = await fetch(`/api/annonces/getStatAdmin`);
     const tmp = await response.json();
     localStorage.setItem('statAdmin', JSON.stringify(tmp));
   } catch (error){
      logError(error, "FONCTION: chargerStat, MODULE: /js/admin.js");
   }
}

/**
 * =======================================================
 *  @function     deconnexion
 *  @description  Description de la fonction
 *  @async
 * =======================================================
  */
function deconnexion() {
     const btnDeconnexion = document.getElementById("btnDeconnexion");
     if (btnDeconnexion) {
          btnDeconnexion.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
               // 1. On appelle la route de déconnexion de notre serveur Express
               const response = await fetch('/auth/logout', {
               method: 'POST'
               });

               if (response.ok) {
               alert('Vous avez été déconnecté avec succès.');

               // 2. Optionnel mais recommandé pour Google Identity Services :
               // Cela évite que Google reconnecte automatiquement l'utilisateur au prochain chargement
               if (typeof google !== 'undefined') {
                    google.accounts.id.disableAutoSelect();
               }
               window.location.href = 'index.html';
               } else {
               alert('Erreur lors de la déconnexion.');
               }
          } catch (error) {
               console.error('Erreur réseau lors de la déconnexion :', error);
          }
        });
    }
}
