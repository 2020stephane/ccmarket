//===========================================================
//    FICHIER : seconnecter.js
//    PROJET  : ccmarket
//    DATE    : 09/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
verifierConnection();

const form = document.getElementById("formConnection");

form.addEventListener("submit", async (e) => {
   e.preventDefault();

   const email = document.getElementById("email").value;
   const motdepasse = document.getElementById("password").value;
   try {
      const response = await fetch("/api/utilisateurs/connection", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email:email, motdepasse:motdepasse })
      });
      const data = await response.json();

      if (response.ok) {
         if (data.admin == 1) {
            window.location.href = "admin.html";
         } else {
         localStorage.setItem('userinfo', JSON.stringify(data));
         window.location.href = "index.html";
         }
      } else {
         alert(data.message);
         window.location.href="seconnecter.html";
      }
   } catch (e) {
          alert("erreur serveur");
          window.location.href="seconnecter.html";
   }
});
const btnd = document.getElementById("deconnection");

btnd.addEventListener("click", async (e) => {
   e.preventDefault();
   try {
      const response = await fetch("/api/utilisateurs/deconnection", {
         method: "POST",
         headers: {
            "Content-Type": "application/json"
         }
      });
      const data = await response.json();

      if (response.ok) {
         localStorage.removeItem('userinfo');
         window.location.href = "index.html";
      } else {
         alert(data.message || "Impossible de se déconnecter.");
         window.location.href = "seconnecter.html";
      }
   } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      alert("Erreur serveur");
      window.location.href = "seconnecter.html";
   }
});
