/**
 * =======================================================
 *  @fileoverview  askGemini.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-07-12
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */

import { logError }           from "/js/tools/logger.js";
/**
 * =======================================================
 *  @function       askGemini
 *  @description    envoie un prompt à gemini
 *  @param {string} le prompt
 *  @async
 * =======================================================
 */
export async function askGemini(prompt) {
     try {
          const response = await fetch("/api/gemini", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ prompt: `${prompt}`}),
          });
          const data = await response.json();
          console.log("gemini = ",data.reponse);
     } catch (error) {
          logError(error,"FONCTION: askGemini, MODULE:askGemini.js");
     }

}
