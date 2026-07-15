/**
 * =======================================================
 *  @fileoverview  details.js
 *  @project       ccmarket
 *  @description   affiche le détails d'une annonce
 *  @version       1.0.0
 *  @date          2026-07-08
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */

import { verifierConnection } from "/js/tools/authentification.js";
import { logError }           from "/js/tools/logger.js";
/**
 * =======================================================
 *  Constantes et variables globales
 * =======================================================
 */
let annonceInfo = null;
let data = null;
/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
try {
     data = await verifierConnection();

     /** ===== MODEL ===== */
     annonceInfo = JSON.parse(localStorage.getItem("annonceInfo"));
     chargerVendeur();

     /** ===== VIEW =====*/
     afficherAnnonce();

     /** ===== CONTROLLERS ===== */
     activerBouton();
     initBoiteContact();
     document.getElementById("btn-retour").addEventListener("click", () => {
     window.history.back();
});
} catch (error) {
     logError(error,"Script principal, MODULE:details.js");
}

/**
 * =======================================================
 *  @function     activerBouton
 *  @description  Active les boutons contacter le vendeur
 *  @description  si l'utilisateur est connecté.
 * =======================================================
 */
function activerBouton() {
     if (data.connection) {
          const btnContact1 = document.getElementById('btn-contact');
          const btnContact2 = document.getElementById('btnContact');
          btnContact1.removeAttribute('disabled');
          btnContact2.removeAttribute('disabled');
     }

}
/**
 * =======================================================
 *  @function     afficherAnnonce
 *  @description  affiche les infos de l'annonce choisis.
 * =======================================================
 */
function afficherAnnonce() {
     if (annonceInfo) {
          const aDesPhotos = annonceInfo.photos && annonceInfo.photos.length > 0;
          const imagePath = aDesPhotos
               ? `/uploads/${annonceInfo.photos[0]}`
               : '/uploads/default.png';
          const datePub = new Date(annonceInfo.date_publication);
          const dateFormatee = datePub.toLocaleDateString('fr-FR');
          document.getElementById("titre").textContent = annonceInfo.titre;
          document.getElementById("prix").textContent = annonceInfo.prix;
          document.getElementById("categorie").textContent = annonceInfo.nom_categorie;
          document.getElementById("descriptif").textContent = annonceInfo.descriptif;
          document.getElementById("date").textContent = dateFormatee;
          document.querySelector(".details-img img").src = imagePath;
          document.querySelector(".details-img img").alt = annonceInfo.titre;
          // Exemple d'utilisation :
const adresse = "220 rue du Marechal Juin 34500 sete";
afficherCarteAnnonce(adresse);
     }
}
function afficherCarteAnnonce(adresseComplete) {
    const iframeMap = document.getElementById('iframe-map');

    // Encode automatiquement les espaces, virgules et caractères spéciaux
    const adresseEncodee = encodeURIComponent(adresseComplete);

    // Mise à jour de la source de l'iframe
    iframeMap.src = `https://maps.google.com/maps?q=${adresseEncodee}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * =======================================================
 *  @function     chargerVendeur
 *  @description  Récupère les infos publiques du vendeur
 *  @async
 * =======================================================
 */
async function chargerVendeur() {
     if (!annonceInfo || !annonceInfo.utilisateur_id) {
          afficherErreurVendeur();
          return;
     }

     try {
          const res = await fetch(`/api/utilisateurs/${annonceInfo.utilisateur_id}/public`, {
               credentials: "include"
          });
          if (!res.ok) throw new Error("Réponse HTTP " + res.status);

          const vendeur = await res.json();
          afficherVendeur(vendeur);
     } catch (error) {
          logError(error, "FONCTION: chargerVendeur, MODULE: details.js");
     }
}
/**
 * =======================================================
 *  @function     afficherVendeur
 *  @description  affiche les infos publiques du vendeur
 * =======================================================
 */
function afficherVendeur(vendeur) {
     const prenom = vendeur.prenom || "";
     const nom = vendeur.nom || "";
     const initiales = (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || "??";

     document.getElementById("sidebarAvatar").textContent = initiales;
     document.getElementById("sidebarPrenom").textContent = `${prenom} ${nom}`.trim() || "Utilisateur";

     const dateInscription = vendeur.date_inscription ? new Date(vendeur.date_inscription) : null;
     document.getElementById("sidebarDateInscription").textContent = dateInscription && !isNaN(dateInscription)
          ? "Membre depuis " + dateInscription.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
          : "";
}
/**
 * =======================================================
 *  @function     initBoiteContact
 *  @description  affiche les infos publiques du vendeur
 * =======================================================
 */
function initBoiteContact() {
     const boite       = document.querySelector(".boiteContact");
     const boiteContent = document.querySelector(".boiteContent");
     const message      = document.getElementById("message");

     const btnsOuvrir  = [
          document.getElementById("btn-contact"),   // bouton dans .details-button
          document.getElementById("btnContact"),    // bouton dans la sidebar vendeur
     ].filter(Boolean); // enlève les null si un des deux boutons n'existe pas sur la page

     const btnFermer   = document.getElementById("btnFermer");
     const btnAnnuler  = document.getElementById("btnAnnuler");
     const btnEnvoyer  = document.getElementById("btnEnregistrer");

     if (!boite) return;
     function ouvrirBoite() {
          boite.classList.add("active");
          message.value = "";
          message.focus();
          document.body.style.overflow = "hidden"; // empêche le scroll derrière la modale
     }

     function fermerBoite() {
          boite.classList.remove("active");
          document.body.style.overflow = "";
     }

     btnsOuvrir.forEach((btn) => btn.addEventListener("click", ouvrirBoite));
     btnFermer?.addEventListener("click", fermerBoite);
     btnAnnuler?.addEventListener("click", fermerBoite);

     boite.addEventListener("click", (e) => {
          if (e.target === boite) {
               fermerBoite();
          }
     });

     document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && boite.classList.contains("active")) {
               fermerBoite();
          }
     });
     boiteContent.addEventListener("click", (e) => e.stopPropagation());

     btnEnvoyer?.addEventListener("click", async () => {
          const texte = message.value.trim();

          if (texte === "") {
               message.focus();
               return;
          }

          try {
               await envoyerMessage(texte);
               fermerBoite();
          } catch (error) {
               logError(error, "FONCTION: initBoiteContact, MODULE: details.js");
          }
     });
}
/**
 * =======================================================
 *  @function     envoyerMessage
 *  @description  Envoie un message au vendeur
 *  @async
 * =======================================================
 */
async function envoyerMessage(texte) {
     if (!texte) {
          alert("Veuillez écrire un message avant d'envoyer.");
          return;
     }
     try {
     const response = await fetch("/api/messages/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
                    contenu:texte,
                    annonce_id: annonceInfo.annonce_id,
                    expediteur_id: data.id,
                    destinataire_id: annonceInfo.utilisateur_id
          })
     });

     if (response.ok) {
          alert("Message envoyé avec succès !");
     } else {
          alert("Erreur lors de l'envoi du message.");
     }
     } catch (error) {
          logError(error, "FONCTION: envoyerMessage, MODULE: details.js");
          console.error("Erreur réseau :", error);
     }
}
