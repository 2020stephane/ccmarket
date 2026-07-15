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
import { logError } from "/js/tools/logger.js";

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
const formUpdateUser = document.getElementById('formUpdateUser');
if (formUpdateUser) {
    formUpdateUser.addEventListener('submit', mettreAJourUtilisateur);
}
const formUpdatePassword = document.getElementById('formUpdatePassword');
if (formUpdatePassword) {
    formUpdatePassword.addEventListener('submit', changerMotDePasse);
}
const formDeleteAccount = document.getElementById('formDeleteAccount');
if (formDeleteAccount) {
    formDeleteAccount.addEventListener('submit', supprimerCompte);
}
/**
 * =======================================================
 *  @function     afficherInfoSidebar
 *  @description  affiche les informations utilisateur
 *                dans la sidebar
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
    const ptrfileAvatar = document.getElementById("modifAvatar");

ptrfileAvatar.addEventListener("change", async () => {
    // On vérifie qu'un fichier a bien été sélectionné
    if (ptrfileAvatar.files && ptrfileAvatar.files[0]) {
        const fichier = ptrfileAvatar.files[0];

        const success = await enregistrerAvatar(fichier);
        if (success) {
            alert("Avatar mis à jour avec succès !");
            // Optionnel : Prévisualiser l'image immédiatement dans le DOM
            const reader = new FileReader();
            reader.onload = (e) => {
                const sidebarAvatar = document.getElementById("sidebarAvatar");
                sidebarAvatar.innerHTML = `<img src="${e.target.result}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            };
            reader.readAsDataURL(fichier);
        } else {
            alert("Erreur lors de l'envoi de l'avatar.");
        }
    }
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
async function verifierImageExiste() {
    try {
        const response = await fetch(`/api/avatar/${infoUser.id}`);
        const data = await response.json();
        if (response.ok) {
            return data;
        }
        return false;
    } catch (error) {
        return false;
    }
}
/**
 * =======================================================
 *  @function     enregistrerAvatar
 *  @description  enregistre une image comme avatar
 *  @async
 * =======================================================
 */
async function enregistrerAvatar(file) {
    try {
         const formData = new FormData();
        formData.append('fichier', file);
        formData.append('user_id', infoUser.id);

        const response = await fetch('/api/avatar', {
            method: "POST",
            credentials: "include",
            body: formData
        });

        return response.ok;
    } catch (error) {
        console.error("Erreur d'envoi avatar :", error);
        return false;
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
    const imageExiste = await verifierImageExiste();

    if (imageExiste) {
        const imagePath = `/img/avatar/${imageExiste.avatar_url}`
        // Si avatarSM.webp existe, on l'affiche
        ptrSidebarAvatar.innerHTML = `<img src="${imagePath}" alt="Avatar de Sophie Martin" class="avatar-img">`;
    }
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
                const response = await fetch('/api/auth/logout', {
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
                    window.location.href = '/html/index.html';
                } else {
                    alert('Erreur lors de la déconnexion.');
                }
            } catch (error) {
                console.error('Erreur réseau lors de la déconnexion :', error);
            }
        });
    }
}
/**
 * =======================================================
 *  @function     mettreAJourUtilisateur
 *  @description  Met à jour les informations du profil utilisateur via fetch
 *  @async
 * =======================================================
 */
async function mettreAJourUtilisateur(event) {
    // Empêche le rechargement de la page par défaut lors de la soumission du formulaire
    event.preventDefault();

    if (!infoUser || !infoUser.id) {
        alert("Erreur : Impossible d'identifier l'utilisateur connecté.");
        return;
    }

    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const email = document.getElementById('email').value;

    const dataModifiee = { nom, prenom, email };

    try {
        const response = await fetch(`/api/utilisateurs/${infoUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(dataModifiee)
        });

        if (response.ok) {
            const result = await response.json();
            alert("Informations mises à jour avec succès !");

            infoUser.nom = nom;
            infoUser.prenom = prenom;
            infoUser.email = email;
            localStorage.setItem("userinfo", JSON.stringify(infoUser));

            afficherInfoSidebar();
        } else {
            const errorData = await response.json();
            alert(`Erreur : ${errorData.message || "Impossible de mettre à jour le profil."}`);
        }
    } catch (error) {
        console.error("Erreur réseau lors de la mise à jour :", error);
        alert("Erreur réseau lors de la mise à jour.");
    }
}
/**
 * =======================================================
 *  @function     changerMotDePasse
 *  @description  Met à jour le mot de passe via fetch
 *  @async
 * =======================================================
 */
async function changerMotDePasse(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Vérification côté client que les deux nouveaux mots de passe concordent
    if (newPassword !== confirmPassword) {
        alert("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
        return;
    }

    try {
        const response = await fetch(`/api/utilisateurs/mdp/${infoUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (response.ok) {
            alert("Mot de passe mis à jour avec succès !");
            // Réinitialise le formulaire
            event.target.reset();
        } else {
            const errorData = await response.json();
            alert(`Erreur : ${errorData.message || "Échec de la mise à jour du mot de passe."}`);
        }
    } catch (error) {
        console.error("Erreur réseau lors du changement de mot de passe :", error);
        alert("Erreur réseau lors de la mise à jour du mot de passe.");
    }
}
/**
 * =======================================================
 *  @function     supprimerCompte
 *  @description  Supprime le compte utilisateur connecté via fetch
 *  @async
 * =======================================================
 */
async function supprimerCompte(event) {
    event.preventDefault();

    if (!infoUser || !infoUser.id) {
        alert("Erreur : Impossible d'identifier l'utilisateur connecté.");
        return;
    }

    // Demande de confirmation préalable à l'utilisateur
    const confirmation = confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est définitive.");
    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(`/api/utilisateurs/delete/${infoUser.id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert("Votre compte a été supprimé avec succès.");

            // Nettoyage de la session côté client

  localStorage.clear();
            if (typeof google !== 'undefined') {
                google.accounts.id.disableAutoSelect();
            }

            // Redirection vers l'accueil
            window.location.href = '/html/index.html';
        } else {
            const errorData = await response.json();
            alert(`Erreur : ${errorData.message || "Impossible de supprimer le compte."}`);
        }
    } catch (error) {
        console.error("Erreur réseau lors de la suppression du compte :", error);
        alert("Erreur réseau lors de la suppression du compte.");
    }
}
