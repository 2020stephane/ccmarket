/**
 * =======================================================
 *  @file         messages.js
 *  @project      ccmarket
 *  @description  Gestion de la messagerie : regroupement en
 *                 conversations, tri par annonce / expéditeur
 *                 / date, recherche et affichage du fil.
 *  @date         2026-07-03
 *  @license      MIT
 * =======================================================
 */
import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/js/tools/logger.js";
import { afficherInfoSidebar } from "/js/tools/sideBar.js";

await verifierConnection();

const infoUser = JSON.parse(localStorage.getItem("userinfo"));
const ptrsidePrenom = document.getElementById("sidebarPrenom");
const ptrsideDate = document.getElementById("sidebarDateInscription");
const ptrSidebarAvatar = document.getElementById("sidebarAvatar");
const CURRENT_USER_ID = infoUser.id;

afficherInfoSidebar();
const messages = await getMessages();
const offres = messages.filter(msg => msg.type_annonce === "Offre");
const demandes = messages.filter(msg => msg.type_annonce === "Demande");

console.log("messages", messages);

const roleChips = document.getElementById('roleChips');
const chips = roleChips.querySelectorAll('.chip');
afficherMessages('offre');

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        // Retire "active" de tous les boutons
        chips.forEach(c => c.classList.remove('active'));
        // Ajoute "active" au bouton cliqué
        chip.classList.add('active');

        // Récupère le rôle sélectionné
        const role = chip.dataset.role;

        afficherMessages(role);
    });
});

function afficherMessages(role) {
     const listeAAfficher = role === 'offre' ? offres : demandes;
     const container = document.getElementById("convList");
     container.innerHTML = '';
     const annoncesUniques = [];
     const idsVus = new Set();

     listeAAfficher.forEach(msg => {
          if (!idsVus.has(msg.annonce_id)) {
               idsVus.add(msg.annonce_id);
               annoncesUniques.push(msg);
        }
    });
     annoncesUniques.forEach(msg => {
          const dateInscription = new Date(msg.date_publication);
          const dateFormatee = dateInscription.toLocaleDateString('fr-FR');
          const div = document.createElement('div');
          div.classList.add('message-item');
          div.innerHTML = `
               <h3>Titre :${msg.annonce_titre}</h3>
               <span>Publé le :${dateFormatee}</span>
          `;
          div.addEventListener('click', () => afficherFilConversation(msg.annonce_id));
          container.appendChild(div);
     });
}
function afficherFilConversation(annonceId) {
    // Récupère tous les messages de cette annonce (envoyés + reçus), triés du plus ancien au plus récent
    const conversation = [...offres, ...demandes]
        .filter(msg => msg.annonce_id === annonceId)
        .sort((a, b) => new Date(a.date_envoi) - new Date(b.date_envoi));

    const threadPanel = document.getElementById('threadPanel');
    threadPanel.innerHTML = '';

    if (conversation.length === 0) {
        threadPanel.innerHTML = `
            <div class="thread-empty">
                <h3>Aucun message trouvé</h3>
            </div>
        `;
        return;
    }

    // En-tête avec le titre de l'annonce
    const header = document.createElement('div');
    header.classList.add('thread-header');
    header.innerHTML = `<h3>${conversation[0].annonce_titre}</h3>`;
    threadPanel.appendChild(header);

    // Affichage de chaque message
    conversation.forEach(msg => {
        const bulle = document.createElement('div');
        bulle.classList.add('thread-message');
        bulle.classList.add(msg.type_message === 'Envoyé' ? 'message-sent' : 'message-received');
        bulle.innerHTML = `
            <p>${msg.contenu}</p>
            <span class="thread-date">${new Date(msg.date_envoi).toLocaleString()}</span>
        `;
        threadPanel.appendChild(bulle);
    });
    const threadbtn = document.getElementById('boiteContact');
    threadbtn.innerHTML = "";
    const footer = document.createElement('div');
    footer.classList.add('thread-footer');
    footer.innerHTML =  `<label for="message">Votre message :</label>
                         <textarea id="message" name="message" rows="5">
                         </textarea>
                         <button type="button" class="envoie">Envoyer un message</button>`;
    threadbtn.appendChild(footer);
    document.querySelector('.envoie').addEventListener('click', () => envoyerMessage(conversation));
}
async function getMessages() {
  try {
    const response = await fetch(`/api/messages/get/${CURRENT_USER_ID}`, { // adaptez le préfixe /api/messages à votre configuration
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    const data = await response.json();
    return data.result;

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    throw error;
  }
}
async function envoyerMessage(conversation) {

 const dest = conversation[0].expediteur_id === CURRENT_USER_ID
    ? conversation[0].destinataire_id
    : conversation[0].expediteur_id;
     const contenu = document.getElementById('message').value.trim();

    // Petite sécurité : on n'envoie pas de message vide
    if (!contenu) {
        alert("Veuillez écrire un message avant d'envoyer.");
        return;
    }
     try {
     const response = await fetch("/api/messages/post", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
               contenu:contenu,
               annonce_id: conversation[0].annonce_id,
               expediteur_id: CURRENT_USER_ID,
               destinataire_id: dest
          })
      });

      if (response.ok) {
            const data = await response.json();
            alert("Message envoyé avec succès !");

            // Optionnel : Vider le champ et fermer la boîte après l'envoi
            document.getElementById('message').value = "";
        } else {
            alert("Erreur lors de l'envoi du message.");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}
