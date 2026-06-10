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

async function checkConnection() {
   try {
      const res = await fetch('/api/connect', { credentials: 'include' });
      const data = await res.json();

      if (data.connecte) {
         const btnc = document.getElementById('btn_connection');
         if (btnc) {
            btnc.textContent = `Bonjour, ${data.prenom} !`;
            btnc.id = "btn_deconnection";
         }

         const disabledLinks = document.querySelectorAll('.nav-menu a.disabled');
         disabledLinks[0].href = "mesannonces.html";
         disabledLinks[1].href = "messagerie.html";
         disabledLinks.forEach(link => {
            link.classList.remove('disabled');
            link.removeAttribute('aria-disabled');
            link.removeAttribute('tabindex');
         });

         localStorage.setItem('userinfo', JSON.stringify(data));

         const b2 = document.getElementById('btn_deconnection');
         b2.addEventListener('click', async function(e) {
            e.preventDefault();
            await fetch('/api/deconnect', { method: 'POST', credentials: 'include' });
            window.location.href = '/index.html';
         });
      }
   } catch {
      window.location.href = '/connection.html';
   }
}

checkConnection();
