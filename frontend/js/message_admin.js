/**
 * =======================================================
 *  @fileoverview  message.js
 *  @project       ccmarket
 *  @description   Module pour la moderation des messages
 *  @version       1.0.0
 *  @date          2026-07-17
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 *
 *  NOTE : les routes API ci-dessous (/api/messages/...) sont
 *  des propositions. Adaptez-les à vos routes réelles côté
 *  serveur (ex: méthode, nom exact, pagination...).
 */
import { verifierConnection } from "/js/tools/authentification.js";
import { logError }           from "/js/tools/logger.js";

let messages = [];
let pageActuelle = 1;
const TAILLE_PAGE = 20;

document.getElementById("annee").textContent = new Date().getFullYear();

deconnexion();
initFiltres();
initModale();
await chargerMessages();

/**
 * =======================================================
 *  @function     chargerMessages
 *  @description  Récupère les messages depuis l'API et met
 *                à jour l'affichage
 *  @async
 * =======================================================
 */
async function chargerMessages() {
   console.log('chargerMessages()');
   try {
      const response = await fetch(`/api/messages/get`);
      const tmp = await response.json();
      messages = tmp.messages ?? tmp; // selon la forme de la réponse API
      afficherCompteurs();
     //  remplirFiltreAnnonces();
     //  afficherMessages();
   } catch (error) {
      logError(error, "FONCTION: chargerMessages, MODULE: /js/message.js");
   }
}

/**
 * =======================================================
 *  @function     afficherCompteurs
 *  @description  Met à jour les compteurs rapides du haut de page
 * =======================================================
 */
function afficherCompteurs() {
   console.log('afficherCompteurs()');
   document.getElementById("totalMessages").textContent = messages.length;
   document.getElementById("totalSignales").textContent = messages.filter(m => m.statut === 'signale').length;
   document.getElementById("totalEnAttente").textContent = messages.filter(m => m.statut === 'en_attente').length;
}

/**
 * =======================================================
 *  @function     remplirFiltreAnnonces
 *  @description  Remplit dynamiquement le select des annonces
 *                à partir des messages chargés
 * =======================================================
 */
function remplirFiltreAnnonces() {
   console.log('remplirFiltreAnnonces()');
   const select = document.getElementById("filtreAnnonce");
   const annoncesVues = new Map();

   messages.forEach(m => {
      if (m.annonce_id && !annoncesVues.has(m.annonce_id)) {
         annoncesVues.set(m.annonce_id, m.annonce_titre ?? `Annonce #${m.annonce_id}`);
      }
   });

   select.innerHTML = '<option value="">Toutes les annonces</option>';
   annoncesVues.forEach((titre, id) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = titre;
      select.appendChild(option);
   });
}

/**
 * =======================================================
 *  @function     getMessagesFiltres
 *  @description  Applique recherche + filtres de statut/annonce
 * =======================================================
 */
function getMessagesFiltres() {
   const recherche = document.getElementById("rechercheMessage").value.trim().toLowerCase();
   const statut = document.getElementById("filtreStatut").value;
   const annonceId = document.getElementById("filtreAnnonce").value;

   return messages.filter(m => {
      const correspondRecherche = !recherche ||
         (m.expediteur_nom ?? '').toLowerCase().includes(recherche) ||
         (m.expediteur_email ?? '').toLowerCase().includes(recherche) ||
         (m.contenu ?? '').toLowerCase().includes(recherche);

      const correspondStatut = !statut || m.statut === statut;
      const correspondAnnonce = !annonceId || String(m.annonce_id) === annonceId;

      return correspondRecherche && correspondStatut && correspondAnnonce;
   });
}

/**
 * =======================================================
 *  @function     afficherMessages
 *  @description  Affiche la page courante des messages filtrés
 *                dans le tableau
 * =======================================================
 */
function afficherMessages() {
   console.log('afficherMessages()');
   const tbody = document.getElementById("listeMessages");
   const filtres = getMessagesFiltres();

   const debut = (pageActuelle - 1) * TAILLE_PAGE;
   const pageMessages = filtres.slice(debut, debut + TAILLE_PAGE);

   tbody.innerHTML = '';

   if (pageMessages.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="table-vide">Aucun message trouvé</td></tr>`;
   }

   pageMessages.forEach((m) => {
      const tr = document.createElement('tr');
      tr.classList.add(`statut-${m.statut ?? 'visible'}`);
      tr.innerHTML = `
         <td>${m.message_id}</td>
         <td>${echapperHtml(m.expediteur_nom ?? '—')}</td>
         <td>${echapperHtml(m.destinataire_nom ?? '—')}</td>
         <td>${echapperHtml(m.annonce_titre ?? `#${m.annonce_id ?? '—'}`)}</td>
         <td class="message-apercu">${echapperHtml(tronquer(m.contenu ?? '', 60))}</td>
         <td>${formatDate(m.date_envoi)}</td>
         <td><span class="badge badge-${m.statut ?? 'visible'}">${libelleStatut(m.statut)}</span></td>
         <td class="actions-cell">
            <button class="btn-voir" data-id="${m.message_id}">👁️</button>
            <button class="btn-signaler-ligne" data-id="${m.message_id}">🚩</button>
            <button class="btn-supprimer-ligne" data-id="${m.message_id}">🗑️</button>
         </td>
      `;
      tbody.appendChild(tr);
   });

   attacherActionsLignes();
   afficherPagination(filtres.length);
}

/**
 * =======================================================
 *  @function     attacherActionsLignes
 *  @description  Attache les listeners des boutons d'action
 *                de chaque ligne du tableau
 * =======================================================
 */
function attacherActionsLignes() {
   document.querySelectorAll(".btn-voir").forEach(btn => {
      btn.addEventListener('click', () => ouvrirModale(btn.dataset.id));
   });
   document.querySelectorAll(".btn-signaler-ligne").forEach(btn => {
      btn.addEventListener('click', () => changerStatutMessage(btn.dataset.id, 'signale'));
   });
   document.querySelectorAll(".btn-supprimer-ligne").forEach(btn => {
      btn.addEventListener('click', () => supprimerMessage(btn.dataset.id));
   });
}

/**
 * =======================================================
 *  @function     afficherPagination
 *  @description  Met à jour l'état des boutons et le numéro
 *                de page affiché
 * =======================================================
 */
function afficherPagination(totalFiltre) {
   const totalPages = Math.max(1, Math.ceil(totalFiltre / TAILLE_PAGE));
   document.getElementById("pageActuelle").textContent = `Page ${pageActuelle} / ${totalPages}`;
   document.getElementById("btnPagePrecedente").disabled = pageActuelle <= 1;
   document.getElementById("btnPageSuivante").disabled = pageActuelle >= totalPages;
}

/**
 * =======================================================
 *  @function     initFiltres
 *  @description  Attache les listeners de recherche, filtres
 *                et pagination
 * =======================================================
 */
function initFiltres() {
   document.getElementById("rechercheMessage").addEventListener('input', () => {
      pageActuelle = 1;
      afficherMessages();
   });
   document.getElementById("filtreStatut").addEventListener('change', () => {
      pageActuelle = 1;
      afficherMessages();
   });
   document.getElementById("filtreAnnonce").addEventListener('change', () => {
      pageActuelle = 1;
      afficherMessages();
   });
   document.getElementById("btnActualiser").addEventListener('click', chargerMessages);

   document.getElementById("btnPagePrecedente").addEventListener('click', () => {
      if (pageActuelle > 1) {
         pageActuelle--;
         afficherMessages();
      }
   });
   document.getElementById("btnPageSuivante").addEventListener('click', () => {
      pageActuelle++;
      afficherMessages();
   });
}

/**
 * =======================================================
 *  @function     ouvrirModale
 *  @description  Ouvre la modale de détail pour un message
 * =======================================================
 */
function ouvrirModale(messageId) {
   console.log('ouvrirModale()', messageId);
   const m = messages.find(msg => String(msg.message_id) === String(messageId));
   if (!m) return;

   document.getElementById("modaleExpediteur").textContent = `${m.expediteur_nom ?? '—'} (${m.expediteur_email ?? '—'})`;
   document.getElementById("modaleDestinataire").textContent = m.destinataire_nom ?? '—';
   document.getElementById("modaleAnnonce").textContent = m.annonce_titre ?? `#${m.annonce_id ?? '—'}`;
   document.getElementById("modaleDate").textContent = formatDate(m.date_envoi);
   document.getElementById("modaleContenu").textContent = m.contenu ?? '';

   const modale = document.getElementById("modaleMessage");
   modale.classList.remove("hidden");
   modale.dataset.messageId = messageId;
}

/**
 * =======================================================
 *  @function     initModale
 *  @description  Attache les listeners de la modale de détail
 * =======================================================
 */
function initModale() {
   document.getElementById("btnFermerModale").addEventListener('click', fermerModale);

   document.getElementById("btnApprouverModale").addEventListener('click', () => {
      const id = document.getElementById("modaleMessage").dataset.messageId;
      changerStatutMessage(id, 'visible');
      fermerModale();
   });
   document.getElementById("btnSignalerModale").addEventListener('click', () => {
      const id = document.getElementById("modaleMessage").dataset.messageId;
      changerStatutMessage(id, 'signale');
      fermerModale();
   });
   document.getElementById("btnSupprimerModale").addEventListener('click', () => {
      const id = document.getElementById("modaleMessage").dataset.messageId;
      supprimerMessage(id);
      fermerModale();
   });
}

function fermerModale() {
   document.getElementById("modaleMessage").classList.add("hidden");
}

/**
 * =======================================================
 *  @function     changerStatutMessage
 *  @description  Change le statut d'un message côté serveur
 *                (visible / signale) puis rafraîchit l'affichage
 *  @async
 * =======================================================
 */
async function changerStatutMessage(messageId, nouveauStatut) {
   console.log('changerStatutMessage()', messageId, nouveauStatut);
   try {
      const response = await fetch(`/api/messages/${messageId}/statut`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ statut: nouveauStatut })
      });
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const m = messages.find(msg => String(msg.message_id) === String(messageId));
      if (m) m.statut = nouveauStatut;
      afficherCompteurs();
      afficherMessages();
   } catch (error) {
      logError(error, "FONCTION: changerStatutMessage, MODULE: /js/message.js");
      alert("Erreur lors de la mise à jour du statut du message.");
   }
}

/**
 * =======================================================
 *  @function     supprimerMessage
 *  @description  Supprime (ou masque) un message après confirmation
 *  @async
 * =======================================================
 */
async function supprimerMessage(messageId) {
   console.log('supprimerMessage()', messageId);
   if (!confirm("Confirmez-vous la suppression de ce message ?")) return;

   try {
      const response = await fetch(`/api/messages/${messageId}`, {
         method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const m = messages.find(msg => String(msg.message_id) === String(messageId));
      if (m) m.statut = 'supprime';
      afficherCompteurs();
      afficherMessages();
   } catch (error) {
      logError(error, "FONCTION: supprimerMessage, MODULE: /js/message.js");
      alert("Erreur lors de la suppression du message.");
   }
}

/**
 * =======================================================
 *  @function     deconnexion
 *  @description  Gère le clic sur le bouton de déconnexion
 *  @async
 * =======================================================
 */
function deconnexion() {
   const btnDeconnexion = document.getElementById("btnDeconnexion");
   if (btnDeconnexion) {
      btnDeconnexion.addEventListener('click', async (e) => {
         e.preventDefault();
         try {
            const response = await fetch('/api/auth/logout', {
               method: 'POST'
            });

            if (response.ok) {
               alert('Vous avez été déconnecté avec succès.');
               if (typeof google !== 'undefined') {
                  google.accounts.id.disableAutoSelect();
               }
               window.location.href = 'index.html';
            } else {
               alert('Erreur lors de la déconnexion.');
            }
         } catch (error) {
            console.error('Erreur réseau lors de la déconnexion :', error);
         }
      });
   }
}

/**
 * =======================================================
 *  Fonctions utilitaires
 * =======================================================
 */
function tronquer(texte, longueur) {
   if (texte.length <= longueur) return texte;
   return texte.slice(0, longueur) + '…';
}

function echapperHtml(texte) {
   const div = document.createElement('div');
   div.textContent = texte;
   return div.innerHTML;
}

function formatDate(dateString) {
   if (!dateString) return '—';
   const date = new Date(dateString);
   if (Number.isNaN(date.getTime())) return '—';
   return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
   });
}

function libelleStatut(statut) {
   switch (statut) {
      case 'signale': return 'Signalé';
      case 'supprime': return 'Supprimé';
      case 'en_attente': return 'En attente';
      default: return 'Visible';
   }
}
