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
 *
 * IMPORTANT :
 * Le tableau RAW_MESSAGES ci-dessous simule le résultat d'une
 * requête SQL sur la table `messages` (message_id, contenu,
 * date_envoi, annonce_id, expediteur_id, destinataire_id),
 * jointe aux tables `annonces` et `utilisateurs` pour récupérer
 * le titre de l'annonce, le nom de l'expéditeur, ET le propriétaire
 * de l'annonce (annonce_proprietaire_id) — c'est cette dernière
 * info qui permet de savoir si le message concerne UNE ANNONCE
 * QUE J'AI PUBLIÉE (on me contacte) ou UNE ANNONCE D'UN AUTRE
 * UTILISATEUR (je le contacte).
 *
 * Exemple de requête à adapter côté back :
 *
 *   SELECT m.message_id, m.contenu, m.date_envoi, m.annonce_id,
 *          m.expediteur_id, m.destinataire_id,
 *          a.titre AS annonce_titre,
 *          a.id_utilisateur AS annonce_proprietaire_id,
 *          u.prenom, u.nom
 *   FROM messages m
 *   JOIN annonces a       ON a.annonce_id = m.annonce_id
 *   JOIN utilisateurs u   ON u.id_utilisateur = m.expediteur_id
 *   WHERE m.expediteur_id = :userId OR m.destinataire_id = :userId
 *   ORDER BY m.date_envoi ASC;
 *
 * Il suffit de remplacer RAW_MESSAGES par le JSON renvoyé par
 * votre API / contrôleur PHP.
 */
import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/tools/logger.js";

const CURRENT_USER_ID = 12; // id de l'utilisateur connecté

const RAW_MESSAGES = [
    // --- Annonces publiées PAR MOI (annonce_proprietaire_id = 12) : des acheteurs me contactent ---
    { message_id: 1, contenu: "Bonjour, votre vélo est-il toujours disponible ?", date_envoi: "2026-06-28T09:12:00", annonce_id: 101, annonce_titre: "VTT Rockrider 27,5\"", annonce_proprietaire_id: 12, expediteur_id: 34, expediteur_nom: "Julien Marchand", destinataire_id: 12 },
    { message_id: 2, contenu: "Oui il est disponible, vous pouvez passer le voir ce week-end.", date_envoi: "2026-06-28T10:03:00", annonce_id: 101, annonce_titre: "VTT Rockrider 27,5\"", annonce_proprietaire_id: 12, expediteur_id: 12, expediteur_nom: "Moi", destinataire_id: 34 },
    { message_id: 3, contenu: "Parfait, je peux venir samedi vers 14h, ça vous va ?", date_envoi: "2026-06-28T10:20:00", annonce_id: 101, annonce_titre: "VTT Rockrider 27,5\"", annonce_proprietaire_id: 12, expediteur_id: 34, expediteur_nom: "Julien Marchand", destinataire_id: 12 },
    { message_id: 6, contenu: "Le canapé fait combien de largeur exactement ?", date_envoi: "2026-06-30T08:30:00", annonce_id: 76, annonce_titre: "Canapé 3 places gris", annonce_proprietaire_id: 12, expediteur_id: 34, expediteur_nom: "Julien Marchand", destinataire_id: 12 },
    { message_id: 7, contenu: "Il fait 210 cm de large, 90 cm de profondeur.", date_envoi: "2026-06-30T09:10:00", annonce_id: 76, annonce_titre: "Canapé 3 places gris", annonce_proprietaire_id: 12, expediteur_id: 12, expediteur_nom: "Moi", destinataire_id: 34 },
    { message_id: 8, contenu: "Merci ! Je réfléchis et je reviens vers vous.", date_envoi: "2026-06-30T09:25:00", annonce_id: 76, annonce_titre: "Canapé 3 places gris", annonce_proprietaire_id: 12, expediteur_id: 34, expediteur_nom: "Julien Marchand", destinataire_id: 12 },
    { message_id: 12, contenu: "Bonjour, la table basse est-elle toujours en vente ?", date_envoi: "2026-07-01T07:40:00", annonce_id: 88, annonce_titre: "Table basse chêne massif", annonce_proprietaire_id: 12, expediteur_id: 41, expediteur_nom: "Sophie Lambert", destinataire_id: 12 },

    // --- Annonces publiées PAR D'AUTRES : c'est MOI qui les contacte ---
    { message_id: 4, contenu: "Bonjour, est-ce que le prix est négociable pour la table basse ?", date_envoi: "2026-06-29T14:45:00", annonce_id: 200, annonce_titre: "Meuble TV scandinave", annonce_proprietaire_id: 57, expediteur_id: 12, expediteur_nom: "Moi", destinataire_id: 57 },
    { message_id: 5, contenu: "Bonjour, je peux descendre à 60€ si vous venez la chercher.", date_envoi: "2026-06-29T15:02:00", annonce_id: 200, annonce_titre: "Meuble TV scandinave", annonce_proprietaire_id: 57, expediteur_id: 57, expediteur_nom: "Amélie Rousseau", destinataire_id: 12 },
    { message_id: 9, contenu: "Bonjour, l'appareil photo est-il encore sous garantie ?", date_envoi: "2026-06-30T18:12:00", annonce_id: 120, annonce_titre: "Appareil photo Canon EOS", annonce_proprietaire_id: 19, expediteur_id: 12, expediteur_nom: "Moi", destinataire_id: 19 },
    { message_id: 10, contenu: "Non, la garantie constructeur est terminée depuis mars.", date_envoi: "2026-06-30T19:00:00", annonce_id: 120, annonce_titre: "Appareil photo Canon EOS", annonce_proprietaire_id: 19, expediteur_id: 19, expediteur_nom: "Karim Belkacem", destinataire_id: 12 },
    { message_id: 11, contenu: "D'accord, merci pour l'info, bonne journée.", date_envoi: "2026-06-30T19:05:00", annonce_id: 120, annonce_titre: "Appareil photo Canon EOS", annonce_proprietaire_id: 19, expediteur_id: 12, expediteur_nom: "Moi", destinataire_id: 19 },
];

let sortMode = "annonce";
let roleFilter = "toutes"; // "toutes" | "recu" | "envoye"
let selectedKey = null;
let conversations = [];

/* -------------------- Regroupement -------------------- */

function otherParty(m) {
    if (m.expediteur_id === CURRENT_USER_ID) {
        const found = RAW_MESSAGES.find(x => x.expediteur_id === m.destinataire_id);
        return { id: m.destinataire_id, nom: found ? found.expediteur_nom : "Utilisateur #" + m.destinataire_id };
    }
    return { id: m.expediteur_id, nom: m.expediteur_nom };
}

function buildConversations() {
    const map = new Map();
    RAW_MESSAGES.forEach(m => {
        const other = otherParty(m);
        const key = m.annonce_id + "-" + other.id;
        if (!map.has(key)) {
            // role = "recu"   -> l'annonce m'appartient, un acheteur me contacte
            // role = "envoye" -> l'annonce appartient à quelqu'un d'autre, je le contacte
            const role = m.annonce_proprietaire_id === CURRENT_USER_ID ? "recu" : "envoye";
            map.set(key, {
                key,
                annonce_id: m.annonce_id,
                annonce_titre: m.annonce_titre,
                annonce_proprietaire_id: m.annonce_proprietaire_id,
                role,
                expediteur_id: other.id,
                expediteur_nom: other.nom,
                messages: [],
            });
        }
        map.get(key).messages.push(m);
    });
    const list = Array.from(map.values());
    list.forEach(c => {
        c.messages.sort((a, b) => new Date(a.date_envoi) - new Date(b.date_envoi));
        c.last = c.messages[c.messages.length - 1];
    });
    return list;
}

/* -------------------- Utils -------------------- */

function initials(name) {
    return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + " " +
           d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function sortConversations(list, mode) {
    const arr = [...list];
    if (mode === "annonce") {
        arr.sort((a, b) => a.annonce_id - b.annonce_id || new Date(b.last.date_envoi) - new Date(a.last.date_envoi));
    } else if (mode === "expediteur") {
        arr.sort((a, b) => a.expediteur_nom.localeCompare(b.expediteur_nom) || new Date(b.last.date_envoi) - new Date(a.last.date_envoi));
    } else if (mode === "date") {
        arr.sort((a, b) => new Date(b.last.date_envoi) - new Date(a.last.date_envoi));
    }
    return arr;
}

function groupLabel(c, mode) {
    if (mode === "annonce") return "Annonce #" + c.annonce_id + " — " + c.annonce_titre;
    if (mode === "expediteur") return c.expediteur_nom;
    return null;
}

/* -------------------- Rendu liste -------------------- */

function renderList() {
    const searchInput = document.getElementById("searchInput");
    const q = searchInput.value.trim().toLowerCase();
    let list = sortConversations(conversations, sortMode);

    if (roleFilter !== "toutes") {
        list = list.filter(c => c.role === roleFilter);
    }

    if (q) {
        list = list.filter(c =>
            c.annonce_titre.toLowerCase().includes(q) ||
            c.expediteur_nom.toLowerCase().includes(q) ||
            c.messages.some(m => m.contenu.toLowerCase().includes(q))
        );
    }

    const container = document.getElementById("convList");
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = '<p class="conv-empty">Aucun message ne correspond à votre recherche.</p>';
        return;
    }

    let lastGroup = null;
    list.forEach(c => {
        const g = groupLabel(c, sortMode);
        if (g !== null && g !== lastGroup) {
            const heading = document.createElement("div");
            heading.className = "conv-group-heading";
            heading.textContent = g;
            container.appendChild(heading);
            lastGroup = g;
        }

        const roleLabel = c.role === "recu" ? "Reçu" : "Envoyé";
        const roleClass = c.role === "recu" ? "role-recu" : "role-envoye";

        const item = document.createElement("div");
        item.className = "conv-item" + (c.key === selectedKey ? " selected" : "");
        item.innerHTML = `
            <div class="conv-avatar">${initials(c.expediteur_nom)}</div>
            <div class="conv-main">
                <div class="conv-top">
                    <span class="conv-name">${c.expediteur_nom}</span>
                    <span class="conv-date">${formatDate(c.last.date_envoi)}</span>
                </div>
                <div class="conv-snippet">${c.last.expediteur_id === CURRENT_USER_ID ? "Vous : " : ""}${c.last.contenu}</div>
                <div class="conv-badges">
                    <span class="role-badge ${roleClass}">${roleLabel}</span>
                    <span class="annonce-badge">#${c.annonce_id} · ${c.annonce_titre}</span>
                </div>
            </div>
        `;
        item.addEventListener("click", () => {
            selectedKey = c.key;
            renderList();
            renderThread(c);
        });
        container.appendChild(item);
    });
}

/* -------------------- Rendu fil de conversation -------------------- */

function renderThread(c) {
    const panel = document.getElementById("threadPanel");
    const roleLabel = c.role === "recu" ? "Reçu · un acheteur vous contacte" : "Envoyé · vous contactez le vendeur";
    const roleClass = c.role === "recu" ? "role-recu" : "role-envoye";
    panel.innerHTML = `
        <div class="thread-header">
            <div>
                <h2>${c.expediteur_nom}</h2>
                <div class="thread-meta">
                    <span class="role-badge ${roleClass}">${roleLabel}</span>
                    <span><b>Annonce</b> #${c.annonce_id} — ${c.annonce_titre}</span>
                </div>
            </div>
            <button type="button" class="btn-secondary">Voir l'annonce</button>
        </div>
        <div class="thread-body" id="threadBody"></div>
        <form class="reply-form" id="replyForm">
            <textarea name="contenu" placeholder="Écrire une réponse…" required></textarea>
            <button type="submit">Envoyer</button>
        </form>
    `;

    const body = panel.querySelector("#threadBody");
    c.messages.forEach(m => {
        const mine = m.expediteur_id === CURRENT_USER_ID;
        const row = document.createElement("div");
        row.className = "msg-row" + (mine ? " mine" : "");
        row.innerHTML = `
            <div class="conv-avatar">${initials(mine ? "Moi" : c.expediteur_nom)}</div>
            <div>
                <div class="msg-bubble">${m.contenu}</div>
                <div class="msg-foot">msg #${m.message_id} · ${formatDate(m.date_envoi)}</div>
            </div>
        `;
        body.appendChild(row);
    });
    body.scrollTop = body.scrollHeight;

    // Soumission du formulaire de réponse (à brancher sur /messages/create)
    panel.querySelector("#replyForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const textarea = e.target.querySelector("textarea");
        const contenu = textarea.value.trim();
        if (!contenu) return;

        // TODO : remplacer par un fetch/POST réel vers le back-end
        const newMsg = {
            message_id: Date.now(),
            contenu,
            date_envoi: new Date().toISOString(),
            annonce_id: c.annonce_id,
            annonce_titre: c.annonce_titre,
            expediteur_id: CURRENT_USER_ID,
            expediteur_nom: "Moi",
            destinataire_id: c.expediteur_id,
        };
        c.messages.push(newMsg);
        c.last = newMsg;
        textarea.value = "";
        renderThread(c);
        renderList();
    });
}

/* -------------------- Initialisation -------------------- */

async function init() {
    try {
        const data = await verifierConnection();
    } catch (error){
        logError(error, "FONCTION: init, MODULE:messages.js");
    }
    conversations = buildConversations();

    document.querySelectorAll("#sortChips .chip").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#sortChips .chip").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            sortMode = btn.dataset.sort;
            renderList();
        });
    });

    document.querySelectorAll("#roleChips .chip").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#roleChips .chip").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            roleFilter = btn.dataset.role;
            renderList();
        });
    });

    document.getElementById("searchInput").addEventListener("input", renderList);

    renderList();
}

document.addEventListener("DOMContentLoaded", init);
