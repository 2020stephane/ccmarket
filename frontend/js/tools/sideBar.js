/**
 * =======================================================
 *  @function     verifierImageExiste
 *  @description  vérifier si une image existe sur le serveur
 *  @async
 * =======================================================
 */
const infoUser = JSON.parse(localStorage.getItem("userinfo"));
const ptrsidePrenom = document.getElementById("sidebarPrenom");
const ptrsideDate = document.getElementById("sidebarDateInscription");
const ptrSidebarAvatar = document.getElementById("sidebarAvatar");

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
 *  @function     afficherInfoSidebar
 *  @description  affiche les information de la sidebar
 * =======================================================
 */
 export function afficherInfoSidebar() {

    const dateInscription = new Date(infoUser.date);
    const dateFormatee = dateInscription.toLocaleDateString('fr-FR');

    afficherAvatar();
    ptrsidePrenom.textContent = infoUser.prenom;
    ptrsideDate.textContent = "Membre depuis le : " + dateFormatee;

}
