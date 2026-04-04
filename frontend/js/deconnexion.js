//===========================================================
//    FICHIER : deconnexion.js
//    PROJET  : ccmarket
//    DATE    : 04/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
// ----------------------------------------------------------
// Déconnexion : supprime le cookie et redirige
// ----------------------------------------------------------

 
      fetch('/api/deconnect', { method: 'POST', credentials: 'include' })
         .then(() => {
            window.location.href = '/index.html';
         })
         .catch(() => {
            window.location.href = '/connection.html';
         });
  

