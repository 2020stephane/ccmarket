//===========================================================
//    FICHIER : contact.js
//    PROJET  : ccmarket
//    DATE    : 17/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
// import { verifierConnection } from "/js/tools/authentification.js";
// verifierConnection();
const form = document.getElementById("formContact");

form.addEventListener("submit", async (e) => {
   e.preventDefault();

   const prenom = document.getElementById("prenom_id").value.trim();
   const nom = document.getElementById("nom_id").value.trim();
   const email = document.getElementById("email_id").value.trim();
   const message = document.getElementById("message_id").value.trim();

   if (!prenom || !nom || !email || !message) {
      afficherErreur("Tous les champs sont obligatoires.");
      return;
   }
try {
      const response = await fetch("/api/contacter/contacter", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ prenom:prenom, nom:nom,  email:email, message:message })
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
