//===========================================================
//    FICHIER : seconnecter.js
//    PROJET  : ccmarket
//    DATE    : 09/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { logError } from "/js/tools/logger.js";
/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
try {
     /** ===== MODEL ===== */
     /** ===== VIEW =====*/
     /** ===== CONTROLLERS ===== */
     initListener();


} catch (error) {
     logError(error,"Script principal, MODULE:seconnecter.js");
}
/**
 * Initialise les écouteurs d'événements du formulaire de connexion classique
 * (email / mot de passe).
 *
 * Attend le chargement complet du DOM, récupère le formulaire d'identifiant
 * `formConnection`, puis intercepte sa soumission pour appeler l'API
 * `/api/auth/loginStandard` en AJAX plutôt que de recharger la page.
 *
 * Comportement :
 * - Si la connexion réussit et que l'utilisateur est administrateur,
 *   redirection vers `admin.html`.
 * - Si la connexion réussit pour un utilisateur standard,
 *   les infos utilisateur sont stockées dans le `localStorage`
 *   et redirection vers `index.html`.
 * - Si la connexion échoue, un message d'erreur est affiché via `alert`.
 *
 * @function initListener
 * @returns {void}
 */
function initListener() {

     document.addEventListener('DOMContentLoaded', () => {
     const formConnection = document.getElementById('formConnection');

     if (formConnection) {
          formConnection.addEventListener('submit', async (e) => {
               e.preventDefault();

               const emailInput = document.getElementById('email');
               const passwordInput = document.getElementById('password');
               if (!emailInput || !passwordInput) {
                    logError(new Error("Champs email/password introuvables dans le DOM"),
                         "FONCTION:initListener, MODULE:seconnecter.js");
                    return;
               }
               const email = emailInput.value;
               const password = passwordInput.value;
               try {
                    const response = await fetch('/api/utilisateurs/loginStandard', {
                         method: 'POST',
                         headers: {
                         'Content-Type': 'application/json'
                         },
                         body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                         if (!data.user) {
                                   logError(
                                        new Error("Réponse API sans propriété 'user'"),
                                        "FONCTION:initListener, MODULE:seconnecter.js"
                                   );
                                   alert('Erreur inattendue lors de la connexion.');
                                   return;
                              }
                         if (data.user.role === `administrateur`){
                              window.location.href = 'admin.html';
                         } else {
                              alert('Connexion réussie !');
                              localStorage.setItem('userinfo', JSON.stringify(data.user));
                              window.location.href = 'index.html';
                    }
                    } else {
                         alert(data.message || 'Identifiants incorrects');
                    }
               } catch (error) {
                    logError(error,"FONCTION:initListener, MODULE:seconnecter.js");
                    console.error('Erreur lors de la connexion classique :', error);
               }
          });
     }
});
}
/**
 * Callback appelé automatiquement par le SDK Google Identity Services
 * après une authentification Google réussie côté client.
 *
 * Envoie le token d'identification Google au backend (`/api/auth/google`)
 * pour vérification et création/récupération de session, puis redirige
 * l'utilisateur selon son rôle.
 *
 * Comportement :
 * - Si la vérification réussit et que l'utilisateur est administrateur,
 *   redirection vers `admin.html`.
 * - Si la vérification réussit pour un utilisateur standard,
 *   les infos utilisateur sont stockées dans le `localStorage`
 *   et redirection vers `index.html`.
 * - Si la vérification échoue, un message d'erreur est affiché via `alert`.
 *
 * @function handleCredentialResponse
 * @param {google.accounts.id.CredentialResponse} response - Objet renvoyé par
 * Google Identity Services, contenant notamment le JWT `credential`.
 * @returns {Promise<void>}
 */
window.handleCredentialResponse = async (response) => {
     const googleToken = response.credential;
     try {
          const res = await fetch('/api/utilisateurs/google', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json'
               },
               body: JSON.stringify({ token: response.credential })
          });

          const data = await res.json();

          if (res.ok) {
               alert('Connexion réussie avec Google !');
               localStorage.setItem('userinfo', JSON.stringify(data.user));
               if (data.user.role == `administrateur`) {
                    window.location.href = 'admin.html';
               } else {
                    window.location.href = 'index.html';
               }
          } else {
               alert('Erreur lors de la connexion : ' + data.message);
          }
     } catch (error) {
               logError(error,"FONCTION: callbackgoogle, MODULE:seconnecter.js");
               console.error('Erreur réseau :', error);
     }
};

