//===========================================================
//    FICHIER : authentification.js
//    PROJET  : ccmarket
//    DATE    : 04/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const bconnect = document.getElementById(`btn_connection`);
bconnect.addEventListener('click', function() {
          window.location.href = '/connection.html'; 
});
fetch('/api/connect', { credentials: 'include' })
   .then(res => res.json())
   .then(data => {
      
      if (data.connecte) {
         const userInfo = document.getElementById('btn_connection');
         if (userInfo) {
            userInfo.textContent = `Bonjour, ${data.prenom} !`;
            userInfo.id = "btn_deconnection";
         }
      const disabledLinks = document.querySelectorAll('.nav-menu a.disabled');
      disabledLinks[0].href = "mesannonces.html";
      disabledLinks[1].href = "messagerie.html";
      disabledLinks.forEach(link => {
            link.classList.remove('disabled');
            link.removeAttribute('aria-disabled');
            link.removeAttribute('tabindex');
         });
      const b2 = document.getElementById('btn_deconnection');
      b2.addEventListener('click', function(e) {
         e.preventDefault();
      fetch('/api/deconnect', { method: 'POST', credentials: 'include' })
         .then(() => {
            window.location.href = '/index.html';
         });
      });
      } 
})
   .catch(() => {
      window.location.href = '/connection.html';
   });
