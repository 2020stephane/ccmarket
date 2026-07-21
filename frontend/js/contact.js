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

/**
 * =======================================================
 *  Constantes partagées
 * =======================================================
 */

/**
 * Élément DOM du formulaire de contact.
 * @type {HTMLFormElement | null}
 */
const form = document.getElementById("formContact");

/**
 * Nombre maximal de caractères autorisés dans le champ message.
 * @constant {number}
 */
const MAX_MESSAGE_LENGTH = 250;

/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
try {
     await verifierConnection();

     /** ===== MODEL ===== */
     /** ===== VIEW =====*/
     /** ===== CONTROLLERS ===== */
     initListener();

} catch (error) {
     logError(error, "Script principal, MODULE:contact.js");
}

/**
 * Initialise les écouteurs d'événements de la page de contact :
 * - soumission du formulaire vers l'API `/api/contacter`
 * - compteur de caractères en temps réel pour le champ message
 *
 * Comportement du formulaire :
 * - Si un champ obligatoire est manquant, affiche une erreur sans appeler l'API.
 * - Si le message dépasse {@link MAX_MESSAGE_LENGTH} caractères, affiche une
 *   erreur sans appeler l'API.
 * - Si l'envoi réussit, redirige vers `index.html`.
 * - Si l'envoi échoue (réponse non-ok ou erreur réseau), affiche un message d'erreur.
 *
 * Comportement du compteur :
 * - Met à jour l'affichage `X / MAX` à chaque saisie.
 * - Empêche la saisie au-delà de {@link MAX_MESSAGE_LENGTH} caractères.
 * - Change la couleur du compteur selon le nombre de caractères restants
 *   (rouge ≤ 20 restants, orange ≤ 75 restants, couleur par défaut sinon).
 *
 * @function initListener
 * @returns {void}
 */
function initListener() {

     if (!form) {
          logError(
               new Error("Formulaire 'formContact' introuvable dans le DOM"),
               "FONCTION:initListener, MODULE:contact.js"
          );
          return;
     }

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

          if (message.length > MAX_MESSAGE_LENGTH) {
               afficherErreur(`Le message ne doit pas dépasser ${MAX_MESSAGE_LENGTH} caractères.`);
               return;
          }

          try {
               const response = await fetch("/api/contacter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prenom, nom, email, message })
               });

               const data = await response.json();

               if (response.ok) {
                    window.location.href = "index.html";
               } else {
                    afficherErreur(data.message || "Erreur lors de l'envoi du message.");
               }
          } catch (error) {
               logError(error, "FONCTION:initListener, MODULE:contact.js");
               afficherErreur("Erreur serveur, veuillez réessayer.");
          }
     });

     const textarea = document.getElementById('message_id');
     const compteur = document.getElementById('message-compteur');

     if (!textarea || !compteur) {
          logError(
               new Error("Élément 'message_id' ou 'message-compteur' introuvable dans le DOM"),
               "FONCTION:initListener, MODULE:contact.js"
          );
          return;
     }

     // Empêche la saisie au-delà de la limite directement dans le champ.
     textarea.setAttribute('maxlength', String(MAX_MESSAGE_LENGTH));

     textarea.addEventListener('input', () => {
          const restants = MAX_MESSAGE_LENGTH - textarea.value.length;
          compteur.textContent = `${textarea.value.length} / ${MAX_MESSAGE_LENGTH}`;

          if (restants <= 20) {
               compteur.style.color = 'red';
          } else if (restants <= 75) {
               compteur.style.color = 'orange';
          } else {
               compteur.style.color = '';
          }
     });
}

/**
 * Affiche un message d'erreur à l'utilisateur dans la zone dédiée du formulaire.
 *
 * @function afficherErreur
 * @param {string} msg - Le message d'erreur à afficher.
 * @returns {void}
 */
function afficherErreur(msg) {
     const el = document.getElementById("msg-erreur");
     if (el) el.textContent = msg;
}
