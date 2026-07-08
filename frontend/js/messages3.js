/**
 * =======================================================
 *  @file         messages.js
 *  @project      ccmarket
 *  @description  Gestion de la messagerie : regroupement en
 *                 conversations, tri par annonce / expéditeur
 *                 / date, filtre reçu/envoyé, recherche,
 *                 affichage du fil et persistance locale.
 *  @date         2026-07-06
 *  @license      MIT
 * =======================================================
 *
 * IMPORTANT :
 * Le tableau SEED_MESSAGES simule le résultat d'une requête SQL
 * sur la table `messages` (message_id, contenu, date_envoi,
 * annonce_id, expediteur_id, destinataire_id), jointe aux tables
 * `annonces` et `utilisateurs` pour récupérer le titre de
 * l'annonce, le nom de l'expéditeur, ET le propriétaire de
 * l'annonce (annonce_proprietaire_id) — c'est cette dernière
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
 * Une fois les routes /api/messages/messages_recus/:id et
 * /api/messages/messages_envoyes/:id opérationnelles côté back,
 * ce fichier les utilise automatiquement et ne retombe sur
 * SEED_MESSAGES que si l'API ne répond rien (mode démo).
 */

import { verifierConnection } from "/js/tools/authentification.js";
import { logError } from "/tools/logger.js";

/* -------------------------------------------------------
   Références DOM (peuvent être absentes selon la page,
   d'où les vérifications avant utilisation)
------------------------------------------------------- */
const ptrsidePrenom = document.getElementById("sidebarPrenom");
const ptrsideDate = document.getElementById("sidebarDateInscription");
const ptrSidebarAvatar = document.getElementById("sidebarAvatar");

/* -------------------------------------------------------
   Utilisateur courant : lecture sécurisée du localStorage.
   Si "userinfo" est absent ou invalide, on retombe sur un
   profil de démo au lieu de planter toute la page.
------------------------------------------------------- */
function chargerInfoUser() {
    try {
        const raw = localStorage.getItem("userinfo");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.id) return parsed;
        }
    } catch (error) {
        logError(error, "FONCTION: chargerInfoUser, MODULE: messages.js");
    }
}

const infoUser = chargerInfoUser();
const CURRENT_USER_ID = infoUser.id;


let RAW_MESSAGES = [];
let sortMode = "annonce";
let roleFilter = "recu"; // "recu" | "envoye"
let selectedKey = null;
let conversations = [];

/* -------------------- Chargement des messages (API + fallback + persistance locale) -------------------- */

function afficherErreurListe(message) {
    const container = document.getElementById("convList");
    if (container) {
        container.innerHTML = `<p class="conv-empty" style="color:#c53030;">${message}</p>`;
    }
}

async function chargerMessagesR(idUtilisateur) {
    try {
        const response = await fetch(`/api/messages/messages_recus/${idUtilisateur}`, {
            credentials: "include"
        });
        if (!response.ok) throw new Error("Réponse HTTP " + response.status);
        const messages_recus = await response.json();
        return Array.isArray(messages_recus) ? messages_recus : [];
    } catch (error) {
        logError(error, "FONCTION: chargerMessagesR, MODULE: messages.js");
        return [];
    }
}

async function chargerMessagesE(idUtilisateur) {
    try {
        const response = await fetch(`/api/messages/messages_envoyes/${idUtilisateur}`, {
            credentials: "include"
        });
        if (!response.ok) throw new Error("Réponse HTTP " + response.status);
        const messages_envoyes = await response.json();
        return Array.isArray(messages_envoyes) ? messages_envoyes : [];
    } catch (error) {
        logError(error, "FONCTION: chargerMessagesE, MODULE: messages.js");
        return [];
    }
}

function dedupeMessages(messages) {
    const map = new Map();
    messages.forEach(m => map.set(m.message_id, m));
    return Array.from(map.values());
}

/**
 * Construit RAW_MESSAGES à partir de l'API (messages reçus +
 * envoyés), complété par les réponses envoyées localement en
 * attendant confirmation back. Si l'API ne renvoie rien du tout
 * (back pas encore prêt), on retombe sur SEED_MESSAGES pour
 * pouvoir continuer à travailler l'interface en mode démo.
 */
async function chargerTousLesMessages(idUtilisateur) {
    const [recus, envoyes] = await Promise.all([
        chargerMessagesR(idUtilisateur),
        chargerMessagesE(idUtilisateur),
    ]);

    let combined = dedupeMessages([...recus, ...envoyes]);

    return combined;
}

/* -------------------- Sidebar utilisateur -------------------- */

async function verifierImageExiste(url) {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function afficherAvatar() {
    if (!ptrSidebarAvatar) return;

    const avatarTestUrl = "img/avatar/avatarSM.webp";
    const imageExiste = await verifierImageExiste(avatarTestUrl);

    if (imageExiste) {
        ptrSidebarAvatar.innerHTML = `<img src="${avatarTestUrl}" alt="Avatar de ${infoUser.prenom || "l'utilisateur"}" class="avatar-img">`;
    } else if (infoUser.avatarUrl) {
        ptrSidebarAvatar.innerHTML = `<img src="${infoUser.avatarUrl}" alt="Avatar de ${infoUser.prenom || "l'utilisateur"}" class="avatar-img">`;
    } else {
        const prenom = infoUser.prenom || "";
        const nom = infoUser.nom || "";
        const initiales = (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
        ptrSidebarAvatar.textContent = initiales || "??";
    }
}

function afficherInfoSidebar() {
    afficherAvatar();

    if (ptrsidePrenom) {
        ptrsidePrenom.textContent = infoUser.prenom || "Utilisateur";
    }
    if (ptrsideDate) {
        const dateInscription = infoUser.date ? new Date(infoUser.date) : null;
        ptrsideDate.textContent = dateInscription && !isNaN(dateInscription)
            ? "Membre depuis le : " + dateInscription.toLocaleDateString("fr-FR")
            : "";
    }
}

/* -------------------- Regroupement -------------------- */

function otherParty(m) {
    if (m.expediteur_id === CURRENT_USER_ID) {
        const nom = m.destinataire_nom || ("Utilisateur #" + m.destinataire_id);
        return { id: m.destinataire_id, nom };
    }
    return { id: m.expediteur_id, nom: m.expediteur_nom || ("Utilisateur #" + m.expediteur_id) };
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
    if (!name || typeof name !== "string") return "??";
    return name.trim().split(" ").filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase();
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
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
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
    if (!container) return;
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
    if (!panel) return;

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

    // TODO : quand la route back sera prête, remplacer la sauvegarde
    // locale par un vrai POST vers /api/messages/create, puis ne
    // conserver sauvegarderMessageEnvoyeLocalement() qu'en repli
    // (offline) le temps que la réponse serveur confirme l'envoi.
    panel.querySelector("#replyForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const textarea = e.target.querySelector("textarea");
        const contenu = textarea.value.trim();
        if (!contenu) return;

        const newMsg = {
            message_id: Date.now(),
            contenu,
            date_envoi: new Date().toISOString(),
            annonce_id: c.annonce_id,
            annonce_titre: c.annonce_titre,
            annonce_proprietaire_id: c.annonce_proprietaire_id,
            expediteur_id: CURRENT_USER_ID,
            expediteur_nom: "Moi",
            destinataire_id: c.expediteur_id,
        };

        RAW_MESSAGES.push(newMsg);
        sauvegarderMessageEnvoyeLocalement(newMsg);

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
        await verifierConnection();
    } catch (error) {
        logError(error, "FONCTION: init, MODULE: messages.js");
    }

    afficherInfoSidebar();

    try {
        RAW_MESSAGES = await chargerTousLesMessages(CURRENT_USER_ID);
    } catch (error) {
        logError(error, "FONCTION: init, MODULE: messages.js");
        afficherErreurListe("Impossible de charger les messages pour le moment.");
        return;
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

    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", renderList);

    renderList();
}

document.addEventListener("DOMContentLoaded", init);
