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
 *  @description  affiche l'avatar dans la sidebar
 *  @async
 * =======================================================
  */
async function afficherAvatar() {
    const image = infoUser.avatar_url;

    if (image) {
        const imagePath = `/uploads/avatar/${image}`
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
