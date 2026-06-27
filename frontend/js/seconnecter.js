//===========================================================
//    FICHIER : seconnecter.js
//    PROJET  : ccmarket
//    DATE    : 09/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/tools/logger.js";
// verifierConnection();

const form = document.getElementById("formConnection");

form.addEventListener("submit", async (e) => {
   e.preventDefault();

   const email = document.getElementById("email").value;
   const motdepasse = document.getElementById("password").value;
   try {
      const response = await fetch("/api/utilisateurs/connection", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email:email, motdepasse:motdepasse })
      });
      const data = await response.json();

      if (response.ok) {
         if (data.admin == 1) {
            window.location.href = "admin.html";
         } else {
         localStorage.setItem('userinfo', JSON.stringify(data));
         window.location.href = "index.html";
         }
      } else {
         alert(data.message);
         window.location.href="seconnecter.html";
      }
   } catch (error) {
          logError(error, "dans le module:seconnecter.js");
          window.location.href="seconnecter.html";
   }
});


document.addEventListener('DOMContentLoaded', () => {
    const formConnection = document.getElementById('formConnection');

    if (formConnection) {
        formConnection.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Connexion réussie !');
                    window.location.href = 'index.html';
                } else {
                    alert(data.message || 'Identifiants incorrects');
                }
            } catch (error) {
                console.error('Erreur lors de la connexion classique :', error);
            }
        });
    }
});
window.handleCredentialResponse = async (response) => {
    // response.credential contient le jeton d'identité sécurisé (JWT) fourni par Google
    const googleToken = response.credential;

    try {
        // On envoie le jeton à notre backend Express pour vérification
        const res = await fetch('/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Connexion réussie avec Google !');
            localStorage.setItem('token', data.token);
            // Redirection vers l'accueil ou le profil
            window.location.href = 'index.html';
        } else {
            alert('Erreur lors de la connexion : ' + data.message);
        }
    } catch (error) {
        console.error('Erreur réseau :', error);
    }
};
