//===========================================================
//    FICHIER : inscription.js
//    PROJET  : ccmarket
//    DATE    : 02/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { ajoutBouttonCompte, verifierConnection} from "/js/tools/authentification.js";
ajoutBouttonCompte();
verifierConnection();
const form = document.getElementById("formInscription");

form.addEventListener("submit", async (e) => {
   e.preventDefault();

   const prenom = document.getElementById("prenom").value.trim();
   const nom = document.getElementById("nom").value.trim();
   const email = document.getElementById("email").value.trim();
   const password = document.getElementById("password").value.trim();
   
   if (!prenom || !nom || !email || !password) {
      afficherErreur("Tous les champs sont obligatoires.");
      return;
   }

   try {
      const response = await fetch("/api/inscription", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ prenom, nom,  email, password })
      });

      const data = await response.json();

      if (response.ok) {
         window.location.href="index.html";
      }else {
         afficherErreur(data.message); 
      }
   } catch {
          afficherErreur("Erreur serveur, veuillez réessayer.");
   }
});
// ==================================================
// function afficherErreur(msg: any): void
// ==================================================
function afficherErreur(msg) {
   const el = document.getElementById("msg-erreur"); 
   if (el) el.textContent = msg;
}
