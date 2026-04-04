//===========================================================
//    FICHIER : authentification.js
//    PROJET  : ccmarket
//    DATE    : 04/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================

 
// ----------------------------------------------------------
// Vérification de la connexion au chargement de la page
// ----------------------------------------------------------

fetch('/api/connect', { credentials: 'include' })
   .then(res => res.json())
   .then(data => {
      if (data.connecte) {

         // Afficher le prénom de l'utilisateur
         const userInfo = document.getElementById('btn-connection');
         if (userInfo) {
            userInfo.textContent = `Bonjour, ${data.prenom} !`;
            userInfo.href = "/deconnexion.js";
            userInfo.id = "btn-deconnection";
         }

         // Activer les liens désactivés dans la nav
        
      const disabledLinks = document.querySelectorAll('.nav-menu a.disabled');
      disabledLinks[0].href = "annonces.html";
      disabledLinks[1].href = "message.html";
      disabledLinks.forEach(link => {
            link.classList.remove('disabled');
            link.removeAttribute('aria-disabled');
            link.removeAttribute('tabindex');
         });
      } 
   })
   .catch(() => {
      window.location.href = '/connexion.html';
   });
