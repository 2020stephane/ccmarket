//===========================================================
//    FICHIER : seconnecter.js
//    PROJET  : ccmarket
//    DATE    : 09/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { logError } from "/js/tools/logger.js";

document.addEventListener('DOMContentLoaded', () => {
    const formConnection = document.getElementById('formConnection');

    if (formConnection) {
        formConnection.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/loginStandard', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.user.role == `administrateur`){
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
        const res = await fetch('/api/auth/google', {
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
        console.error('Erreur réseau :', error);
    }
};
