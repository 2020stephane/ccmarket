/**
 * =======================================================
 *  @fileoverview  moderation.job.js
 *  @project       ccmarket
 *  @description   Vérifie quotidiennement les nouveaux
 *                  messages via Gemini (propos racistes/injurieux)
 * =======================================================
 */

import { GoogleGenAI } from "@google/genai";
import db                     from '../bdd/db.js';
import { logError }           from "../tools/logger.js";

const ai = new GoogleGenAI({});

/**
 * Schéma de sortie forcé : Gemini doit répondre en JSON structuré,
 * pas en texte libre, pour qu'on puisse le traiter automatiquement.
 */
const SCHEMA_MODERATION = {
     type: "object",
     properties: {
          conforme: { type: "boolean" },
          motif: { type: "string" },
     },
     required: ["conforme", "motif"],
};

/**
 * =======================================================
 *  @function     analyserMessage
 *  @description  Envoie un message à Gemini pour classification
 * =======================================================
 */
async function analyserMessage(contenu) {
     const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Tu es un modérateur de contenu pour une plateforme d'annonces entre particuliers.
Analyse le message suivant et détermine s'il contient des propos racistes, injurieux, haineux ou discriminatoires.

Message à analyser :
"""
${contenu}
"""

Réponds uniquement selon le schéma JSON demandé. Si le message est conforme, motif doit être une chaîne vide.`,
          config: {
               responseMimeType: "application/json",
               responseSchema: SCHEMA_MODERATION,
          },
     });

     return JSON.parse(response.text);
}

/**
 * =======================================================
 *  @function     lancerModeration
 *  @description  Récupère les messages en attente et les
 *                fait analyser un par un par Gemini
 * =======================================================
 */
export async function lancerModeration() {
     console.log(`[MODERATION] Démarrage — ${new Date().toISOString()}`);

     try {
          const [messages] = await db.query(
               `SELECT message_id, contenu FROM messages WHERE statut_moderation = 'en_attente' LIMIT 5`
          );

          if (messages.length === 0) {
               console.log("[MODERATION] Aucun message à vérifier.");
               return;
          }

          for (const msg of messages) {
               try {
                    const resultat = await analyserMessage(msg.contenu);

                    const statut = resultat.conforme ? "ok" : "signale";

                    await db.query(
                         `UPDATE messages
                          SET statut_moderation = ?, motif_moderation = ?, date_moderation = NOW()
                          WHERE message_id = ?`,
                         [statut, resultat.motif || null, msg.message_id]
                    );

                    if (!resultat.conforme) {
                         console.warn(`[MODERATION] Message ${msg.message_id} signalé : ${resultat.motif}`);
                         // ici tu peux notifier un admin, bloquer l'utilisateur, etc.
                    }

                    // petite pause pour ne pas dépasser le quota gratuit de l'API
                    await new Promise((r) => setTimeout(r, 300));
               } catch (error) {
                    logError(error, `FONCTION: analyserMessage, message_id=${msg.message_id}`);
               }
          }

          console.log(`[MODERATION] Terminé — ${messages.length} message(s) traité(s).`);
     } catch (error) {
          logError(error, "FONCTION: lancerModeration, MODULE: moderation.js");
     }
}
