//===========================================================
//    FICHIER : messagerie.js
//    PROJET  : ccmarket
//    DATE    : 22/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/tools/logger.js";

/**
 * =======================================================
 *  Point d'entrée / Script principal
 * =======================================================
 */
const data = await verifierConnection();

document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById('chatMessages');
    const chatInputForm = document.getElementById('chatInputForm');
    const messageInput = document.getElementById('messageInput');

    // Mettre le scroll tout en bas dès le chargement de la conversation
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    scrollToBottom();

    // Gestion de l'envoi de message (Simulation en local avant liaison BDD)
    chatInputForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const texteMessage = messageInput.value.trim();
        if (!texteMessage) return;

        // Création de l'élément HTML de la bulle de message (Envoyé)
        const date = new Date();
        const heure = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-sent';
        messageDiv.innerHTML = `
            <div class="message-bubble">${texteMessage}</div>
            <span class="message-time">${heure}</span>
        `;

        // Ajout dans la boîte de dialogue
        chatMessages.appendChild(messageDiv);

        // Reset du champ d'écriture et auto-scroll
        messageInput.value = '';
        scrollToBottom();

        // TODO: Envoyer le message via fetch (POST) ou via WebSocket à votre Backend Express
    });

    // Exemple de changement dynamique de discussion lors d'un clic à gauche
    const discussionItems = document.querySelectorAll('.discussion-item');
    discussionItems.forEach(item => {
        item.addEventListener('click', () => {
            discussionItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Ici vous irez charger les messages associés à l'ID de la conversation :
            const conversationId = item.getAttribute('data-conversation-id');
            console.log("Chargement de la conversation : " + conversationId);
        });
    });
});
