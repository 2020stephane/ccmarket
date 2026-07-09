/**
 * =======================================================
 *  @fileoverview  categories.js
 *  @project       ccmarket
 *  @description   Description du fichier
 *  @version       1.0.0
 *  @date          2026-07-09
 *  @author        Stephane Brisse <https://github.com/2020stephane/ccmarket.git>
 *  @license       MIT
 * =======================================================
 */
import { logError } from "/tools/logger.js";

export async function chargerCategories() {
   try {
     const response = await fetch(`/api/annonces/getCategories`);
     const tmp = await response.json();

     localStorage.setItem('categories', JSON.stringify(tmp));

   } catch (error){
      logError(error, "FONCTION: chargerCategories, MODULE: /js/utils/categories.js");
   }
}
