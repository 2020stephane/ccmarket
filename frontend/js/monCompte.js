/**
 * =======================================================
 *  @fileoverview  monCompte.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-06-27
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */

import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/tools/logger.js";
/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */

verifierConnection();
deconnexion();

function deconnexion() {
     const btnDeconnexion = document.getElementById("btn-logout");
     if (btnDeconnexion) {
        btnDeconnexion.addEventListener('click', async (e) => {
           e.preventDefault();
            try {
                // 1. On appelle la route de déconnexion de notre serveur Express
                const response = await fetch('/auth/logout', {
                    method: 'POST'
                });

                if (response.ok) {
                    alert('Vous avez été déconnecté avec succès.');

                    // 2. Optionnel mais recommandé pour Google Identity Services :
                    // Cela évite que Google reconnecte automatiquement l'utilisateur au prochain chargement
                    if (typeof google !== 'undefined') {
                        google.accounts.id.disableAutoSelect();
                    }

                    // 3. Redirection vers la page d'accueil ou de connexion
                    window.location.href = 'index.html';
                } else {
                    alert('Erreur lors de la déconnexion.');
                }
            } catch (error) {
                console.error('Erreur réseau lors de la déconnexion :', error);
            }
        });
    }
}
