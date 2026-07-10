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
chargerMessages();

async function chargerMessages() {
     await chargerMessagesR(CURRENT_USER_ID);
     await chargerMessagesE(CURRENT_USER_ID);

}


async function chargerMessagesR(idUtilisateur) {
    try {
        const response = await fetch(`/api/messages/messages_recus/${idUtilisateur}`, {
            credentials: "include"
        });
        const messages_recus = await response.json();

        if (messages_recus && messages_recus.length > 0) {
            localStorage.setItem("messages_recus", JSON.stringify(messages_recus));
        } else {
            localStorage.removeItem("messages_recus");
        }
    } catch (error) {
        logError(error, "FONCTION: chargermessagesR, MODULE: messages.js");
    }
}

async function chargerMessagesE(idUtilisateur) {
    try {
        const response = await fetch(`/api/messages/messages_envoyes/${idUtilisateur}`, {
            credentials: "include"
        });
        const messages_envoyes = await response.json();

        if (messages_envoyes && messages_envoyes.length > 0) {
            localStorage.setItem("messages_envoyes", JSON.stringify(messages_envoyes));
        } else {
            localStorage.removeItem("messages_envoyes");
        }
    } catch (error) {
        logError(error, "FONCTION: chargermessagesE, MODULE: messages.js");
    }
}
