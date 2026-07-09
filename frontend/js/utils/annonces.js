/**
 * =======================================================
 *  @fileoverview  annonces.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-07-09
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
/**
 * =======================================================
 *  @function     chargerAnnonces
 *  @description  Extrait (x) annonces de la base de données
 *  @description  Triées par date de publication décroissante
 *  @async
 * =======================================================
 */
import { logError } from "/tools/logger.js";

export async function chargerAnnonces(nombreAnnonces, categorie, keyword) {
   try {
     const params = new URLSearchParams({
          limite: nombreAnnonces,
          categorie: categorie,
          keyword: keyword
     });
     const response = await fetch(`/api/annonces/derniers_ajouts?${params}`);
     const tmp = await response.json();

     localStorage.setItem('derniersAjouts', JSON.stringify(tmp));

   } catch (error){
      logError(error, "FONCTION: chargerAnnonces, MODULE: /js/utils/annonces.js");
   }
}
/**
 * =======================================================
 *  @function     chargerStat
 *  @description
 *
 *  @async
 * =======================================================
 */
export async function chargerStat() {
   try {
     const response = await fetch(`/api/annonces/getStatistiques`);
     const tmp = await response.json();

     localStorage.setItem('annoncesStat', JSON.stringify(tmp));

   } catch (error){
      logError(error, "FONCTION: chargerStat, MODULE: /js/utils/annonces.js");
   }
}
