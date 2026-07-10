/**
 * =======================================================
 *  @fileoverview  details.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-07-08
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
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

const data = await verifierConnection();
let annonceInfo = null;

chargerAnnonce();
afficherAnnonce();
chargerVendeur();
initBtnVendeur();

function chargerAnnonce() {
     annonceInfo = JSON.parse(localStorage.getItem("annonceInfo"));
     console.log('annonce = ', annonceInfo);
}
function afficherAnnonce() {
     if (annonceInfo) {
          const aDesPhotos = annonceInfo.photos && annonceInfo.photos.length > 0;
          const imagePath = aDesPhotos
               ? `/uploads/${annonceInfo.photos[0]}`
               : '/uploads/default.png';
          const datePub = new Date(annonceInfo.date_publication);
          document.getElementById("titre").textContent = annonceInfo.titre;
          document.getElementById("prix").textContent = annonceInfo.prix;
          document.getElementById("categorie").textContent = annonceInfo.nom_categorie;
          document.getElementById("descriptif").textContent = annonceInfo.descriptif;
          document.getElementById("date").textContent = datePub;
          document.querySelector(".details-img img").src = imagePath;
          document.querySelector(".details-img img").alt = annonceInfo.titre;
     }
}

/**
 * Récupère les infos publiques du vendeur (celui qui a publié
 * l'annonce, identifié par annonceInfo.utilisateur_id) et les
 * affiche dans la fiche à droite de l'annonce.
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
          afficherErreurVendeur();
     }
}

function afficherVendeur(vendeur) {
     const prenom = vendeur.prenom || "";
     const nom = vendeur.nom || "";
     const initiales = (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || "??";

     document.getElementById("sellerAvatar").textContent = initiales;
     document.getElementById("sellerNom").textContent = `${prenom} ${nom}`.trim() || "Utilisateur";

     const dateInscription = vendeur.date_inscription ? new Date(vendeur.date_inscription) : null;
     document.getElementById("sellerDepuis").textContent = dateInscription && !isNaN(dateInscription)
          ? "Membre depuis " + dateInscription.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
          : "";
}

function afficherErreurVendeur() {
     const card = document.getElementById("sellerCard");
     if (card) {
          document.getElementById("sellerNom").textContent = "Vendeur indisponible";
          document.getElementById("sellerDepuis").textContent = "";
     }
}
function initBtnVendeur() {
     const ptrbtn = document.getElementById("btnContact");
     ptrbtn.addEventListener("click", (e) => {
          e.preventDefault();

          dialogContact();
     });
}
function dialogContact() {
     const ptrboite = document.querySelector(".boiteContact");
     ptrboite.classList.add("active");
     const ptrEnregistrer = document.getElementById("btnEnregistrer");
     ptrEnregistrer.addEventListener("click", () => {
          envoyerMessage();
     });
     const ptrAnnuler = document.getElementById("btnAnnuler");
     ptrAnnuler.addEventListener("click", () => {
          ptrboite.classList.remove("active");
     });
}
async function envoyerMessage() {
     const contenu = document.getElementById('message').value.trim();
 console.log('contenu', contenu);
 console.log('annonce_id', annonceInfo.annonce_id);
 console.log('expediteur_id', data.id);
 console.log('destinataire_id', annonceInfo.utilisateur_id);
    // Petite sécurité : on n'envoie pas de message vide
    if (!contenu) {
        alert("Veuillez écrire un message avant d'envoyer.");
        return;
    }
     try {
     const response = await fetch("/api/messages/postmessage", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
               contenu:contenu,
               annonce_id: annonceInfo.annonce_id,
               expediteur_id: data.id,
               destinataire_id: annonceInfo.utilisateur_id
          })
      });

      if (response.ok) {
            const data = await response.json();
            alert("Message envoyé avec succès !");

            // Optionnel : Vider le champ et fermer la boîte après l'envoi
            document.getElementById('message').value = "";
            document.querySelector('.boiteContact').classList.remove('active');
        } else {
            alert("Erreur lors de l'envoi du message.");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}
