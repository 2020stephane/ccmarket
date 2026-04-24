//===========================================================
//    FICHIER : modifier_annonce.js
//    PROJET  : ccmarket
//    DATE    : 21/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
function recupId() {
   const parametres = new URLSearchParams(window.location.search);
   const id = parametres.get('id');
console.log(id);
}
recupId();
