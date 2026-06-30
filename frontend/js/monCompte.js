/**
 * =======================================================
 *  @fileoverview  monCompte.js
 *  @project       ccmarket
 *  @description   gestion du compte
 *  @version       1.0.0
 *  @date          2026-06-27
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */

import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/tools/logger.js";

const infoUser = JSON.parse(localStorage.getItem("userinfo"));
const ptrsidePrenom = document.getElementById("sidebarPrenom");
const ptrsideDate = document.getElementById("sidebarDateInscription");
const ptrSidebarAvatar = document.getElementById("sidebarAvatar");
console.log('infoUser = ',infoUser);
/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */

verifierConnection();
const formDelete = document.getElementById('formDeleteAccount');

    if (infoUser && infoUser.id) {
        // On concatène l'URL de base avec l'ID de l'utilisateur
        formDelete.action = `/utilisateur/delete/${infoUser.id}`;
    }
afficherInfoSidebar();
afficherInfoForm();
selectionMenu();
deconnexion();
/**
 * =======================================================
 *  @function     afficherInfoSidebar
 *  @description  affiche les information de la sidebar
 * =======================================================
 */
function afficherInfoSidebar() {

    const dateInscription = new Date(infoUser.date);
    const dateFormatee = dateInscription.toLocaleDateString('fr-FR');

    afficherAvatar();
    ptrsidePrenom.textContent = infoUser.prenom;
    ptrsideDate.textContent = "Membre depuis le : " + dateFormatee;

}
/**
 * =======================================================
 *  @function     afficherInfoForm
 *  @description  affiche les information dans le formulaire
 * =======================================================
 */
function afficherInfoForm() {

    if (infoUser) {
        document.getElementById('nom').value = infoUser.nom || '';
        document.getElementById('prenom').value = infoUser.prenom || '';
        document.getElementById('email').value = infoUser.email || '';
    }
}
/**
 * =======================================================
 *  @function     selectionMenu
 *  @description  affiche les information dans le formulaire
 * =======================================================
 */
function selectionMenu() {
const liensSidebar = document.querySelectorAll('.sidebar-link');
    const sectionProfil = document.getElementById('section-profil');
    const sectionSecurite = document.getElementById('section-securite');


    const hashActuel = window.location.hash; // ex: #securite si l'utilisateur y était
    if (hashActuel === '#securite') {
        basculerAffichage('#securite',sectionProfil,sectionSecurite);
        // On met à jour la classe active sur les liens
        liensSidebar.forEach(l => l.classList.remove('active'));
        document.querySelector('a[href="#securite"]').classList.add('active');
    } else {
        basculerAffichage('#profil',sectionProfil,sectionSecurite);
    }

    // 4. Écoute du clic sur chaque lien de la sidebar
    liensSidebar.forEach(lien => {
        lien.addEventListener('click', (e) => {
            // Optionnel : e.preventDefault(); si vous ne voulez pas que l'URL change (ex: toto.com/#securite)

            // Retirer la classe 'active' de tous les liens et l'ajouter au lien cliqué
            liensSidebar.forEach(l => l.classList.remove('active'));
            lien.classList.add('active');

            // Récupérer la cible (ex: '#profil' ou '#securite')
            const cible = lien.getAttribute('href');
            basculerAffichage(cible,sectionProfil,sectionSecurite);
        });
    });
}
// 2. Fonction pour basculer l'affichage des sections
    function basculerAffichage(cible,sectionProfil,sectionSecurite) {
        if (cible === '#securite') {
            sectionProfil.style.display = 'none';
            sectionSecurite.style.display = 'block';
        } else {
            // Par défaut ou si '#profil', on affiche les infos personnelles
            sectionProfil.style.display = 'block';
            sectionSecurite.style.display = 'none';
        }
    }
/**
 * =======================================================
 *  @function     verifierImageExiste
 *  @description  vérifier si une image existe sur le serveur
 *  @async
 * =======================================================
 */
async function verifierImageExiste(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok; // Renvoie true si le statut est entre 200 et 299
    } catch (error) {
        return false; // Renvoie false si le fichier n'existe pas ou s'il y a une erreur réseau
    }
}
/**
 * =======================================================
 *  @function     afficherAvatar
 *  @description  Description de la fonction
 *  @async
 * =======================================================
  */
async function afficherAvatar() {
    const avatarTestUrl = "img/avatar/avatarSM.webp";
    // 1. On vérifie d'abord si l'avatar de test existe dans le dossier frontend
    const imageExiste = await verifierImageExiste(avatarTestUrl);

    if (imageExiste) {
        // Si avatarSM.webp existe, on l'affiche
        ptrSidebarAvatar.innerHTML = `<img src="${avatarTestUrl}" alt="Avatar de Sophie Martin" class="avatar-img">`;
    }
    // 2. Sinon, on se rabat sur l'avatar de l'utilisateur de la base de données (si présent)
    else if (infoUser.avatarUrl) {
        ptrSidebarAvatar.innerHTML = `<img src="${infoUser.avatarUrl}" alt="Avatar de ${infoUser.prenom}" class="avatar-img">`;
    }
    // 3. Si aucun des deux n'existe, on met les initiales
    else {
        const prenom = infoUser.prenom || "";
        const nom = infoUser.nom || "";
        const initiales = (prenom.charAt(0) + nom.charAt(0)).toUpperCase();

        ptrSidebarAvatar.textContent = initiales || "??";
    }
}
/**
 * =======================================================
 *  @function     deconnexion
 *  @description  Description de la fonction
 *  @async
 * =======================================================
  */
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
                    localStorage.removeItem("userinfo");
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
