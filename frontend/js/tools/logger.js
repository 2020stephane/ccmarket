/**
 * =======================================================
 *  @fileoverview  logger.js
 *  @project       ccmarket
 *  @description   Envoie les erreurs au backend via POST /api/log-error
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */

export async function logError(error, contexte = "inconnu", extra = {}) {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    contexte,
    stack: error instanceof Error ? error.stack : null,
    url: window.location.href,
    extra,
  };

  try {
    await fetch("/api/log_error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (fetchErr) {
      console.error("[ERREUR] Impossible d'envoyer l'erreur au serveur :", fetchErr);
  }
  console.error(`[ERREUR][${contexte}]`, `${error.message}`);
}
