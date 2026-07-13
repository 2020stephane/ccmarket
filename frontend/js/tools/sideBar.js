/**
 * =======================================================
 *  @fileoverview  sideBar.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-07-10
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */

const infoUser = JSON.parse(localStorage.getItem("userinfo"));
const ptrsidePrenom = document.getElementById("sidebarPrenom");
const ptrsideDate = document.getElementById("sidebarDateInscription");
const ptrSidebarAvatar = document.getElementById("sidebarAvatar");
/**
 * =======================================================
 *  @function     afficherInfoSidebar
 *  @description  affiche les informations utilisateur
 *                dans la sidebar
 * =======================================================
 */
export function afficherInfoSidebar() {

    const dateInscription = new Date(infoUser.date);
    const dateFormatee = dateInscription.toLocaleDateString('fr-FR');

    afficherAvatar();
    ptrsidePrenom.textContent = infoUser.prenom;
    ptrsideDate.textContent = "Membre depuis le : " + dateFormatee;

}
/**
 * =======================================================
 *  @function     afficherAvatar
 *  @description  Description de la fonction
 *  @async
 * =======================================================
  */
async function afficherAvatar() {
    const imageExiste = await verifierImageExiste(infoUser.id);

    if (imageExiste) {
        const imagePath = `/img/avatar/${imageExiste.avatar_url}`
        // Si avatarSM.webp existe, on l'affiche
        ptrSidebarAvatar.innerHTML = `<img src="${imagePath}" alt="Avatar" class="avatar-img">`;
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
 *  @function     verifierImageExiste
 *  @description  vérifier si une image existe sur le serveur
 *  @async
 * =======================================================
 */
export async function verifierImageExiste(id) {
    try {
        const response = await fetch(`/api/avatar/${id}`);
        const data = await response.json();
        if (response.ok) {
            return data;
        }
        return false;
    } catch (error) {
        return false; // Renvoie false si le fichier n'existe pas ou s'il y a une erreur réseau
    }
}
export async function recupAvatar(userid) {
     const imageExiste = await verifierImageExiste(userid);
     if (imageExiste) {
        const imagePath = `/img/avatar/${imageExiste.avatar_url}`
        const avatar = `<img src="${imagePath}" alt="Avatar" class="avatar-img">`;
        return avatar;
    }
    else {
        const prenom = infoUser.prenom || "";
        const nom = infoUser.nom || "";
        const initiales = ((prenom.charAt(0) + nom.charAt(0)).toUpperCase()) || "??";
          const avatar = `<p class="message-avatar">${initiales}</p>`;
        return avatar;
    }
}
