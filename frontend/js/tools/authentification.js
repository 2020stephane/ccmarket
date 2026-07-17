//===========================================================
//    FICHIER : authentification.js
//    PROJET  : ccmarket
//    DATE    : 04/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { logError } from "/js/tools/logger.js";

export async function verifierConnection() {
   try {
      const res = await fetch('/api/auth/status', { credentials: 'include' });
      const data = await res.json();

      const pageActuelle = window.location.pathname.split("/").pop() || "index.html";
      const pagesPrivees = ["mesannonces.html", "publication.html", "messages.html", "monCompte.html"];

      if (data.connection) {
         const btnc = document.getElementById('seconnecter');
         if (btnc) {
             btnc.textContent = "Mon Compte";
             btnc.href = "/html/monCompte.html";
         }
         const disabledLinks = document.querySelectorAll('.nav-links a.disabled');
         if (disabledLinks.length >= 3) {
            disabledLinks[0].href = "/html/mesannonces.html";
            disabledLinks[1].href = "/html/publication.html";
            disabledLinks[2].href = "/html/messages.html";
         }
         disabledLinks.forEach(link => {
            link.classList.remove('disabled');
            link.removeAttribute('aria-disabled');
            link.removeAttribute('tabindex');
         });
      } else if (pagesPrivees.includes(pageActuelle)) {
         // ✅ Utilisateur NON connecté sur une page privée → redirection
         window.location.href = "/html/index.html";
      }

      return data;
   } catch (error){
      logError(error, "FONCTION : verifierConnection, MODULE: authentification.js");
   }
}
