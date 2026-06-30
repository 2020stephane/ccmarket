//===========================================================
//    FICHIER : authentification.js
//    PROJET  : ccmarket
//    DATE    : 04/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { logError } from "/tools/logger.js";

export async function verifierConnection() {
   try {
      const res = await fetch('/auth/status', { credentials: 'include' });
      const data = await res.json();

      if (data.connection) {
         const btnc = document.getElementById('seconnecter');
         if (btnc) {
             btnc.textContent = "Mon Compte";
             btnc.href = "monCompte.html";
             }
         const disabledLinks = document.querySelectorAll('.nav-links a.disabled');
         disabledLinks[0].href = "mesannonces.html";
         disabledLinks[1].href = "publication.html";
         disabledLinks[2].href = "messagerie.html";
         disabledLinks.forEach(link => {
            link.classList.remove('disabled');
            link.removeAttribute('aria-disabled');
            link.removeAttribute('tabindex');
         });
      }
      return data;
   } catch (error){
      logError(error, "FONCTION : verifierConnection, MODULE: authentification.js");
   }
}
// export async function verifierConnection() {
//    try {
//       const res = await fetch('/api/status', { credentials: 'include' });

//       // On récupère le nom de la page actuelle (ex: "index.html" ou "mesannonces.html")
//       const pageActuelle = window.location.pathname.split("/").pop() || "index.html";

//       // Liste des pages qui demandent obligatoirement d'être connecté
//       const pagesPrivees = ["mesannonces.html", "messagerie.html", "modifierAnnonce.html", "supprimerAnnonce.html"];

//       // 1. Si le serveur renvoie une erreur (401, etc.) -> Utilisateur NON connecté
//       if (!res.ok) {
//          if (pagesPrivees.includes(pageActuelle)) {
//             window.location.href = '/seconnecter.html';
//          }
//          return; // On arrête l'exécution ici, pas besoin de lire le JSON
//       }

//       const data = await res.json();

//       // 2. Si l'utilisateur EST connecté
//       if (data.connection) {
//          const btnc = document.getElementById('seconnecter');
//          if (btnc) { btnc.textContent = `Bonjour, ${data.prenom} !`; }

//          const disabledLinks = document.querySelectorAll('.nav-menu a.disabled');

//          if (disabledLinks.length >= 2) {
//             disabledLinks[0].href = "mesannonces.html";
//             disabledLinks[1].href = "messagerie.html";
//          }

//          disabledLinks.forEach(link => {
//             link.classList.remove('disabled');
//             link.removeAttribute('aria-disabled');
//             link.removeAttribute('tabindex');
//          });
//       } else {
//          // 3. Si le serveur répond 200 mais connection: false -> Utilisateur NON connecté
//          if (pagesPrivees.includes(pageActuelle)) {
//             window.location.href = '/seconnecter.html';
//          }
//       }

//    } catch (error) {
//       console.error("Erreur réseau :", error);
//       // En cas de crash réseau, on ne bloque pas l'accueil non plus
//       const pageActuelle = window.location.pathname.split("/").pop() || "index.html";
//       const pagesPrivees = ["mesannonces.html", "messagerie.html"];
//       if (pagesPrivees.includes(pageActuelle)) {
//          window.location.href = '/seconnecter.html';
//       }
//    }
// }
