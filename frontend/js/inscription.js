//===========================================================
//    FICHIER : inscription.js
//    PROJET  : ccmarket
//    DATE    : 02/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection} from "/js/tools/authentification.js";
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
      const response = await fetch("/api/utilisateurs/inscription", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ prenom:prenom, nom:nom,  email:email, password:password })
      });

      const data = await response.json();

      if (response.ok) {
         localStorage.setItem('userinfo', JSON.stringify(data));
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
