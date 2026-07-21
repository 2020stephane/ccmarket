/**
 * =======================================================
 *  @fileoverview  inscription.js
 *  @project       ccmarket
 *  @description   Permet l'inscription d'un utilisateur.
 *  @version       1.0.1
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */
import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/js/tools/logger.js";

/**
 * =======================================================
 *  Constantes et variables globales
 * =======================================================
 */

/**
 * Élément DOM du formulaire d'inscription.
 * @type {HTMLFormElement | null}
 */
const form = document.getElementById("formInscription");

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
     logError(error, "Script principal, MODULE:inscription.js");
}

/**
 * Initialise l'écouteur d'événement du formulaire d'inscription.
 *
 * Intercepte la soumission du formulaire, valide que tous les champs
 * obligatoires sont renseignés, puis envoie les informations à l'API
 * `/api/auth` pour créer le compte utilisateur.
 *
 * Comportement :
 * - Si un champ obligatoire est manquant, affiche un message d'erreur
 *   sans appeler l'API.
 * - Si l'inscription réussit, stocke les infos utilisateur dans le
 *   `localStorage` et redirige vers `index.html`.
 * - Si l'inscription échoue (réponse non-ok ou erreur réseau),
 *   affiche un message d'erreur à l'utilisateur.
 *
 * @function initListener
 * @returns {void}
 */
function initListener() {

     if (!form) {
          logError(
               new Error("Formulaire 'formInscription' introuvable dans le DOM"),
               "FONCTION:initListener, MODULE:inscription.js"
          );
          return;
     }

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
               const response = await fetch("/api/utilisateurs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prenom:prenom, nom:nom,  email:email, password:password })
               });

               const data = await response.json();

               if (response.ok) {
                    if (!data.user) {
                         logError(
                              new Error("Réponse API sans propriété 'user'"),
                              "FONCTION:initListener, MODULE:inscription.js"
                         );
                         afficherErreur("Erreur inattendue lors de l'inscription.");
                         return;
                    }

                    localStorage.setItem('userinfo', JSON.stringify(data.user));
                    window.location.href = "index.html";
               } else {
                    afficherErreur(data.message || "Erreur lors de l'inscription.");
               }
          } catch (error) {
               logError(error, "FONCTION:initListener, MODULE:inscription.js");
               afficherErreur("Erreur serveur, veuillez réessayer.");
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
