//===========================================================
//    FICHIER : connection.js
//    PROJET  : ccmarket
//    DATE    : 09/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const form = document.getElementById("formInscription");

form.addEventListener("submit", async (e) => {
   e.preventDefault();

   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;
   try {
      const response = await fetch("/api/connection", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, password })
      });
      if (response.ok) {
         const bconnect = document.getElementById(`btn_compte`);
         bconnect.dataset.etat = 'connecte'
         window.location.href="index.html";
         return;
      }
         const data = await response.json();
         alert(data.message);
         window.location.href="connection.html";
   } catch (e) {
          alert("erreur serveur");
          window.location.href="connection.html";
   }
});
