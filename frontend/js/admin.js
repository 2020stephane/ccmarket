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
/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
try {
     /** ===== MODEL ===== */
     await chargerStat();
     const stat = JSON.parse(localStorage.getItem('statAdmin'));

     /** ===== VIEW =====*/
     afficherStat();
     afficherPrixStats();
     afficherParCategorie();
     afficherTopUtilisateurs();
     afficherAnnoncesPopulaires();
     afficherInscriptionsParMois();
     afficherAnnoncesParMois();

     /** ===== CONTROLLERS ===== */
     deconnexion();

} catch (error) {
     logError(error,"Script principal, MODULE:index.js");
}


function afficherStat() {

     document.getElementById("totalUtilisateurs").textContent = stat.compteurs.nb_utilisateurs;
     document.getElementById("totalAnnonces").textContent = stat.compteurs.nb_annonces;
     document.getElementById("totalMessages").textContent = stat.compteurs.nb_messages;
     document.getElementById("totalCategories").textContent = stat.compteurs.nb_categories;
     document.getElementById("totalContacts").textContent = stat.compteurs.nb_contacts;
     document.getElementById("totalPhotos").textContent = stat.compteurs.nb_photos;
}

/**
 * =======================================================
 *  @function     afficherPrixStats
 *  @description  Affiche le prix moyen, min et max des annonces
 * =======================================================
 */
function afficherPrixStats() {

   const prixStats = stat.prixStats;
   if (!prixStats) return;

   const formatPrix = (valeur) => {
      if (valeur === null || valeur === undefined) return '—';
      return Number(valeur).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
   };

   document.getElementById("prixMoyen").textContent = formatPrix(prixStats.prix_moyen);
   document.getElementById("prixMin").textContent = formatPrix(prixStats.prix_min);
   document.getElementById("prixMax").textContent = formatPrix(prixStats.prix_max);
}

/**
 * =======================================================
 *  @function     afficherParCategorie
 *  @description  Affiche le nombre d'annonces par catégorie
 * =======================================================
 */
function afficherParCategorie() {

   const tbody = document.getElementById("listeParCategorie");
   const parCategorie = stat.parCategorie;
   if (!tbody || !parCategorie) return;

   tbody.innerHTML = '';
   parCategorie.forEach((ligne) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
         <td>${ligne.categorie}</td>
         <td>${ligne.nb_annonces}</td>
      `;
      tbody.appendChild(tr);
   });
}

/**
 * =======================================================
 *  @function     afficherTopUtilisateurs
 *  @description  Affiche le top 10 des utilisateurs les plus actifs
 * =======================================================
 */
function afficherTopUtilisateurs() {

   const tbody = document.getElementById("listeTopUtilisateurs");
   const topUtilisateurs = stat.topUtilisateurs;
   if (!tbody || !topUtilisateurs) return;

   tbody.innerHTML = '';
   topUtilisateurs.forEach((utilisateur) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
         <td>${utilisateur.utilisateur_id}</td>
         <td>${utilisateur.nom}</td>
         <td>${utilisateur.prenom}</td>
         <td>${utilisateur.nb_annonces}</td>
      `;
      tbody.appendChild(tr);
   });
}

/**
 * =======================================================
 *  @function     afficherAnnoncesPopulaires
 *  @description  Affiche le top 10 des annonces les plus contactées
 * =======================================================
 */
function afficherAnnoncesPopulaires() {

   const tbody = document.getElementById("listeAnnoncesPopulaires");
   const annoncesPopulaires = stat.annoncesPopulaires;
   if (!tbody || !annoncesPopulaires) return;

   tbody.innerHTML = '';
   annoncesPopulaires.forEach((annonce) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
         <td>${annonce.annonce_id}</td>
         <td>${annonce.titre}</td>
         <td>${annonce.nb_messages}</td>
      `;
      tbody.appendChild(tr);
   });
}

/**
 * =======================================================
 *  @function     afficherInscriptionsParMois
 *  @description  Affiche le nombre d'inscriptions par mois
 * =======================================================
 */
function afficherInscriptionsParMois() {

   const tbody = document.getElementById("listeInscriptionsParMois");
   const inscriptionsParMois = stat.inscriptionsParMois;
   if (!tbody || !inscriptionsParMois) return;

   tbody.innerHTML = '';
   inscriptionsParMois.forEach((ligne) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
         <td>${ligne.mois}</td>
         <td>${ligne.nb_inscriptions}</td>
      `;
      tbody.appendChild(tr);
   });
}

/**
 * =======================================================
 *  @function     afficherAnnoncesParMois
 *  @description  Affiche le nombre d'annonces publiées par mois
 * =======================================================
 */
function afficherAnnoncesParMois() {

   const tbody = document.getElementById("listeAnnoncesParMois");
   const annoncesParMois = stat.annoncesParMois;
   if (!tbody || !annoncesParMois) return;

   tbody.innerHTML = '';
   annoncesParMois.forEach((ligne) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
         <td>${ligne.mois}</td>
         <td>${ligne.nb_annonces}</td>
      `;
      tbody.appendChild(tr);
   });
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
               const response = await fetch('/api/utilisateurs/logout', {
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
