//===========================================================
//    FICHIER : inscription.js
//    PROJET  : ccmarket
//    DATE    : 02/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const form = document.getElementById("formInscription");

form.addEventListener("submit", async (e) => {
   e.preventDefault();

   const prenom = document.getElementById("prenom").value;
   const nom = document.getElementById("nom").value;
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;
   
   try {
      const response = await fetch("/api/inscription", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ prenom, nom,  email, password })
      });
      if (response.ok) {
         window.location.href="index.html";
         return;
      }
         const data = await response.json();
         alert(data.message);
         window.location.href="inscription.html";
   } catch (e) {
          alert("erreur serveur");
          window.location.href="inscription.html";
   }
});
