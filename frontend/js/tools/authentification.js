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
             btnc.textContent = "";
             btnc.href = "/html/monCompte.html";

             const avatarUrl = getAvatarUrl();

             if (avatarUrl) {
                const img = document.createElement('img');
                img.src = `/uploads/avatar/${avatarUrl}`;
                img.alt = "Mon compte";
                img.classList.add('avatar-menu'); // même classe que dans la sidebar
                btnc.appendChild(img);
             } else {
                const span = document.createElement('span');
                span.classList.add('avatar-initiales'); // même classe que dans la sidebar
                span.textContent = getInitiales(data.prenom, data.nom);
                btnc.appendChild(span);
             }
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
function getInitiales(prenom = "", nom = "") {
   const i1 = prenom.trim().charAt(0).toUpperCase();
   const i2 = nom.trim().charAt(0).toUpperCase();
   return (i1 + i2) || "?";
}
function getAvatarUrl() {
   try {
      const userinfo = JSON.parse(localStorage.getItem('userinfo'));
      return userinfo?.avatar_url || null;
   } catch (error) {
      return null;
   }
}
