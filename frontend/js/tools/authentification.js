//===========================================================
//    FICHIER : authentification.js
//    PROJET  : ccmarket
//    DATE    : 04/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
export async function verifierConnection() {
   try {
      const res = await fetch('/api/status', { credentials: 'include' });
      const data = await res.json();

      if (data.connection) {
         const btnc = document.getElementById('seconnecter');
         if (btnc) { btnc.textContent = `Bonjour, ${data.prenom} !`; }
         const disabledLinks = document.querySelectorAll('.nav-menu a.disabled');
         disabledLinks[0].href = "mesannonces.html";
         disabledLinks[1].href = "messagerie.html";
         disabledLinks.forEach(link => {
            link.classList.remove('disabled');
            link.removeAttribute('aria-disabled');
            link.removeAttribute('tabindex');
         });
      }
   } catch {
      window.location.href = '/seconnecter.html';
   }
}
