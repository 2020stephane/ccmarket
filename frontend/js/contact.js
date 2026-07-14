/**
 * =======================================================
 *  @fileoverview  contact.js
 *  @project       ccmarket
 *  @description   script pour la page de contact
 *  @version       1.0.0
 *  @date          2026-06-17
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
import { verifierConnection } from "/js/tools/authentification.js";
import { logError }           from "/js/tools/logger.js";

verifierConnection();

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
         window.location.href="index.html";
      }else {
         afficherErreur(data.message);
      }
   } catch (error){
      logError(error, "dans le module:contact.js");
          afficherErreur("Erreur serveur, veuillez réessayer.");
   }
});


const textarea    = document.getElementById('message_id');
const compteur    = document.getElementById('message-compteur');
const MAX         = 250;

textarea.addEventListener('input', () => {
    const restants = MAX - textarea.value.length;
    compteur.textContent = `${textarea.value.length} / ${MAX}`;

    if (restants <= 20) {
        compteur.style.color = 'red';
    } else if (restants <= 75) {
        compteur.style.color = 'orange';
    } else {
        compteur.style.color = '';
    }
});
// ==================================================
// function afficherErreur(msg: any): void
// ==================================================
function afficherErreur(msg) {
   const el = document.getElementById("msg-erreur");
   if (el) el.textContent = msg;
}
