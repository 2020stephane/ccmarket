/**
 * =======================================================
 *  @fileoverview  logger.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-06-24
 *  @author        Stephane Brisse
 *  @license       MIT
 * =======================================================
 */
/**
 * logger.js — Frontend
 * Envoie les erreurs au backend via POST /api/log-error
 * À inclure dans vos pages HTML : <script src="/js/logger.js"></script>
 */

export async function logError(error, contexte = "inconnu", extra = {}) {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    contexte,
    stack: error instanceof Error ? error.stack : null,
    url: window.location.href,  // page courante automatiquement
    extra,
  };

  try {
    await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (fetchErr) {
    // Si le serveur est injoignable, on affiche juste en console
    console.error("[logger] Impossible d'envoyer l'erreur au serveur :", fetchErr);
  }

  // Toujours afficher en console pour le développement
  console.error(`[ERREUR][${contexte}]`, error);
}

// ─── Exemple d'utilisation dans vos fichiers JS frontend ─────────────────────
//
// try {
//   const res = await fetch("/api/produits");
//   const data = await res.json();
// } catch (err) {
//   await logError(err, "chargement des produits", { userId: 42 });
// }
