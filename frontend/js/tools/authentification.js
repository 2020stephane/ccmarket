//===========================================================
//    FICHIER : authentification.js
//    PROJET  : ccmarket
//    DATE    : 04/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
export function ajoutBouttonCompte() {
   const bconnect = document.getElementById(`btn_compte`);
   bconnect.addEventListener('click', async function() {
      if (bconnect.dataset.etat === 'connecte') {
         await fetch('/api/deconnection', { method: 'POST', credentials: 'include' });
         bconnect.dataset.etat = 'deconnecte'
         window.location.href = '/index.html';
      } else {
         window.location.href = '/connection.html';
      }
   });
}

export async function verifierConnection() {
   try {
      const res = await fetch('/api/status', { credentials: 'include' });
      const data = await res.json();

      if (data.connection) {
         const btnc = document.getElementById('btn_compte');
         if (btnc) {
            btnc.textContent = `Bonjour, ${data.prenom} !`;
            // btnc.dataset.etat = 'connecte';
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

         // const b2 = document.getElementById('btn_deconnection');
         // b2.addEventListener('click', async function(e) {
         //    e.preventDefault();
         //    await fetch('/api/deconnect', { method: 'POST', credentials: 'include' });
         //    window.location.href = '/index.html';
         // });
      }
   } catch {
      window.location.href = '/connection.html';
   }
}
