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
import { verifierConnection }  from "/js/tools/authentification.js";
import { logError }            from "/js/tools/logger.js";
import { afficherInfoSidebar, recupAvatar } from "/js/tools/sideBar.js";

/**
 * =======================================================
 *  variables partagées
 * =======================================================
 */
let CURRENT_USER_ID = 0;
let infoUser = null;
let offres = [];
let demandes = [];

/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
try {
     const data = await verifierConnection();
     CURRENT_USER_ID = data.id;

     /** ===== MODEL ===== */
     infoUser = JSON.parse(localStorage.getItem("userinfo"));

     await chargerMessages();

     /** ===== VIEW =====*/
     afficherInfoSidebar();
     const roleChips = document.getElementById('roleChips');
     const chips = roleChips.querySelectorAll('.chip');
     afficherMessages('offre');

     /** ===== CONTROLLERS ===== */
     initMenuSidebar();

} catch (error) {
     logError(error,"Script principal, MODULE:messages.js");
}
/**
 * =======================================================
 *  @function     chargerMessages
 *  @description  recupere les messages et les classes
 *                par offre et demandes
 *  @async
 * =======================================================
 */
async function chargerMessages() {
     try {
    const messages = await getMessages();
    offres = messages.filter(msg => msg.type_annonce === "Offre");
    demandes = messages.filter(msg => msg.type_annonce === "Demande");
console.log('offres = ',offres);
console.log('demandes',demandes);
} catch (error) {
    logError(error, "messages.js: échec du chargement des messages");
    const container = document.getElementById("convList");
    if (container) {
        container.innerHTML = `<p class="conv-empty">Impossible de charger vos messages pour le moment. Réessayez plus tard.</p>`;
    }
}
}
/**
 * =======================================================
 *  @function     afficherMessages
 *  @description  affiche les messages dans la sidebar
 * =======================================================
 */
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

    if (annoncesUniques.length === 0) {
        container.innerHTML = '<p class="conv-empty">Aucun message pour le moment.</p>';
        return;
    }

    annoncesUniques.forEach(msg => {
        const dateInscription = new Date(msg.date_publication);
        const dateFormatee = dateInscription.toLocaleDateString('fr-FR');
        const div = document.createElement('div');
        div.classList.add('message-item');
        div.dataset.annonceId = msg.annonce_id;
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');
        div.innerHTML = `
             <h3>Titre : ${echapperHTML(msg.annonce_titre)}</h3>
             <span>Publié le : ${dateFormatee}</span>
        `;
        div.addEventListener('click', () => selectionnerConversation(msg.annonce_id));
        div.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectionnerConversation(msg.annonce_id);
            }
        });
        container.appendChild(div);
    });
}
/**
 * =======================================================
 *  @function     selectionnerConversation
 *  @description  selection d'une conversation
 *  @param {int}  annonceId
 * =======================================================
 */
function selectionnerConversation(annonceId) {
    const container = document.getElementById('convList');
    container.querySelectorAll('.message-item').forEach(item => {
        item.classList.toggle('active', item.dataset.annonceId === String(annonceId));
    });
    afficherFilConversation(annonceId);
}
/**
 * =======================================================
 *  @function     afficherFilConversation
 *  @description  affiche le fil de conversation
 *  @param {int}  annonceId
 * =======================================================
 */
function afficherFilConversation(annonceId) {

    const conversation = [...offres, ...demandes]
        .filter(msg => msg.annonce_id === annonceId)
        .sort((a, b) => new Date(a.date_envoi) - new Date(b.date_envoi));
console.log('conversation =',conversation);
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
const header = document.createElement('div');
header.classList.add('thread-header');

const premierMsg = conversation[0];
header.innerHTML = `<h3>${echapperHTML(premierMsg.annonce_titre)}</h3>`;

// On extrait les interlocuteurs uniques (par id)
const interlocuteursVus = new Map();

conversation.forEach(msg => {
    const estExpediteur = msg.expediteur_id === CURRENT_USER_ID;
    const autreId = estExpediteur ? msg.destinataire_id : msg.expediteur_id;
    const nomAutreUtilisateur = estExpediteur
        ? `${msg.destinataire_prenom} ${msg.destinataire_nom}`
        : `${msg.expediteur_prenom} ${msg.expediteur_nom}`;

    if (!interlocuteursVus.has(autreId)) {
        interlocuteursVus.set(autreId, nomAutreUtilisateur);
    }
});

// Une ligne cliquable par interlocuteur unique
interlocuteursVus.forEach((nom, id) => {
    const ligne = document.createElement('span');
    ligne.classList.add('thread-interlocuteur');
    ligne.textContent = `Conversation avec ${nom}`;
    ligne.style.cursor = 'pointer'; // indication visuelle que c'est cliquable

    ligne.addEventListener('click', () => {
        afficherMessagesDeConversation(conversation, id);
    });

    header.appendChild(ligne);
});

threadPanel.appendChild(header);
const content = document.createElement('div');
content.classList.add('thread-message');
content.id = 'content-mess';
threadPanel.appendChild(content);

//     conversation.forEach(msg => {
//         const bulle = document.createElement('div');
//         bulle.classList.add('thread-message');
//         bulle.classList.add(msg.type_message === 'Envoyé' ? 'message-sent' : 'message-received');

//         // L'auteur d'un message est toujours son expéditeur, quel que soit le lecteur connecté
//         const prenom = msg.expediteur_prenom || "";
//         const nom = msg.expediteur_nom || "";
//         const initiales = (prenom.charAt(0) + nom.charAt(0)).toUpperCase();

//         const nomAuteur = `${msg.expediteur_prenom} ${msg.expediteur_nom}`;
//         let imagePath = msg.expediteur_avatar;
//      if (imagePath) {
//           imagePath = `/uploads/avatar/${msg.expediteur_avatar}`;

//         bulle.innerHTML = `
//             <div class="bull-content">
//             <img src="${imagePath}" alt="Avatar de ${echapperHTML(nomAuteur)}" class="avatar-img">
//             <p>${echapperHTML(msg.contenu)}</p>
//             </div>
//             <span class="thread-date">${new Date(msg.date_envoi).toLocaleString()}</span>
//         `;
//      } else {
//           bulle.innerHTML = `
//             <div class="bull-content">
//             <div class="message-initials">${initiales}</div>
//             <p>${echapperHTML(msg.contenu)}</p>
//             </div>
//             <span class="thread-date">${new Date(msg.date_envoi).toLocaleString()}</span>
//         `;
//      }
//         threadPanel.appendChild(bulle);
//     });

//     const boiteContact = document.getElementById('boiteContact');
//     boiteContact.innerHTML = "";
//     const footer = document.createElement('div');
//     footer.classList.add('thread-footer');
//     footer.innerHTML = `<label for="message">Votre message :</label>
//                          <textarea id="message" name="message" rows="5"></textarea>
//                          <button type="button" class="envoie">Envoyer un message</button>`;
//     boiteContact.appendChild(footer);
//     footer.querySelector('.envoie').addEventListener('click', () => envoyerMessage(conversation, annonceId));
}
function afficherMessagesDeConversation(conversation, autreUtilisateurId) {
    // On filtre les messages échangés avec cet interlocuteur précis
    const messagesFiltres = conversation.filter(msg => {
        const estExpediteur = msg.expediteur_id === CURRENT_USER_ID;
        const autreId = estExpediteur ? msg.destinataire_id : msg.expediteur_id;
        return autreId === autreUtilisateurId;
    });

    const messagesPanel = document.getElementById('content-mess');
    messagesPanel.innerHTML = '';
console.log('messagesFiltres = ',messagesFiltres);
    messagesFiltres.forEach(msg => {
        const estExpediteur = msg.expediteur_id === CURRENT_USER_ID;

        const bulle = document.createElement('div');
        bulle.classList.add('thread-message');
        bulle.classList.add(estExpediteur ? 'message-sent' : 'message-received');
const prenom = msg.expediteur_prenom || "";
         const nom = msg.expediteur_nom || "";
         const initiales = (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
         const nomAuteur = `${msg.expediteur_prenom} ${msg.expediteur_nom}`;
let imagePath = msg.expediteur_avatar;
     if (imagePath) {
          imagePath = `/uploads/avatar/${msg.expediteur_avatar}`;

        bulle.innerHTML = `
            <div class="bull-content">
            <img src="${imagePath}" alt="Avatar de ${echapperHTML(nomAuteur)}" class="avatar-img">
            <p>${echapperHTML(msg.contenu)}</p>
            </div>
            <span class="thread-date">${new Date(msg.date_envoi).toLocaleString()}</span>
        `;
     } else {
          bulle.innerHTML = `
            <div class="bull-content">
            <div class="message-initials">${initiales}</div>
            <p>${echapperHTML(msg.contenu)}</p>
            </div>
            <span class="thread-date">${new Date(msg.date_envoi).toLocaleString()}</span>
        `;
     }
        messagesPanel.appendChild(bulle);
    });
        const boiteContact = document.getElementById('boiteContact');
    boiteContact.innerHTML = "";
    const footer = document.createElement('div');
    footer.classList.add('thread-footer');
    footer.innerHTML = `<label for="message">Votre message :</label>
                         <textarea id="message" name="message" rows="5"></textarea>
                         <button type="button" class="envoie">Envoyer un message</button>`;
    boiteContact.appendChild(footer);
    footer.querySelector('.envoie').addEventListener('click', () => envoyerMessage(messagesFiltres));
}
/**
 * =======================================================
 *  @function     getMessages
 *  @description  charge les messages de la bdd
 *  @async
 * =======================================================
 */
async function getMessages() {
    try {
        const response = await fetch(`/api/messages/get/${CURRENT_USER_ID}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status}`);
        }

        const data = await response.json();
        return data.result;

    } catch (error) {
        logError('Erreur lors de la récupération des messages:', error);
        throw error;
    }
}
/**
 * =======================================================
 *  @function     envoyerMessage
 *  @description  sauvegarde un message dans la bdd
 *  @async
 * =======================================================
 */
async function envoyerMessage(conversation) {
    const dest = conversation[0].expediteur_id === CURRENT_USER_ID
        ? conversation[0].destinataire_id
        : conversation[0].expediteur_id;
    const champMessage = document.getElementById('message');
    const contenu = champMessage.value.trim();

    if (!contenu) {
        alert("Veuillez écrire un message avant d'envoyer.");
        return;
    }

    try {
        const response = await fetch("/api/messages/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contenu: contenu,
                annonce_id: conversation[0].annonce_id,
                expediteur_id: CURRENT_USER_ID,
                destinataire_id: dest
            })
        });

        if (response.ok) {
            alert("Message envoyé avec succès !");
            champMessage.value = "";
            const messages = await getMessages();
            offres = messages.filter(msg => msg.type_annonce === "Offre");
            demandes = messages.filter(msg => msg.type_annonce === "Demande");
            afficherFilConversation(conversation[0].annonce_id);
        } else {
            alert("Erreur lors de l'envoi du message.");
        }
    } catch (error) {
        logError(error,"Erreur réseau :");
        alert("Erreur réseau lors de l'envoi du message.");
    }
}
/**
 * =======================================================
 *  @function     initMenuSidebar
 *  @description  initialise le menu de la sidebar
 * =======================================================
 */
function initMenuSidebar() {
     const roleChips = document.getElementById('roleChips');
     const chips = roleChips.querySelectorAll('.chip');

     chips.forEach(chip => {
          chip.addEventListener('click', () => {
               chips.forEach(c => c.classList.remove('active'));
               chip.classList.add('active');
               const role = chip.dataset.role;
               afficherMessages(role);
          });
     });
}
/**
 * =======================================================
 *  @function     echapperHTML
 *  @description  fonction echap pour faille xss
 * =======================================================
 */
function echapperHTML(texte) {
    const div = document.createElement('div');
    div.textContent = texte ?? '';
    return div.innerHTML;
}
