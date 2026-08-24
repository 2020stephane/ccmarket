//===========================================================
//    FICHIER : boiteDialogue.js
//    PROJET  : ccmarket
//    DATE    : 22/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
export function boiteDialogue(dialog, id) {


  //const dialog = document.getElementById("ma_boite_dialogue");
  const btnAnnuler = document.getElementById("btn_annuler");
  const btnConfirmer = document.getElementById("btn_confirmer");

  // Fermer la boîte si on clique sur Annuler
  btnAnnuler.addEventListener("click", () => {
    dialog.close();
  });

  // Action de confirmation
  btnConfirmer.addEventListener("click", async () => {

    const response = await fetch(`/api/annonces/supprimerannonce/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    dialog.close();
//     window.location.reload();
  });
}
