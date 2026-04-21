//===========================================================
//    FICHIER : test.js
//    PROJET  : ccmarket
//    DATE    : 20/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
function test() {
   

   const btnFermer = document.getElementById('fermer');
console.log("dialog=" + dialog);
// .showModal() ouvre la fenêtre au centre avec un arrière-plan sombre
   btnFermer.addEventListener('click', () => dialog.close());
} 
