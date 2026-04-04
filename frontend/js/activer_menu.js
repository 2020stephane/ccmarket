//===========================================================
//    FICHIER : activer_menu.js
//    PROJET  : ccmarket
//    DATE    : 03/04/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
function activerMenusSiConnecte() {
  
   const user = sessionStorage.getItem('user') || localStorage.getItem('user');
  
  if (!user) return;

    if (connecte) {
      const disabledLinks = document.querySelectorAll('.nav-menu a.disabled');
      disabledLinks[0].href = "annonces.html";
      disabledLinks[1].href = "message.html";
      disabledLinks.forEach(link => link.classList.remove('disabled'));
      const seConnecterLink = document.querySelector('.nav-menu a.seconnecter');
      if (seConnecterLink) {
        seConnecterLink.textContent = data.prenom || "deconnection";
        seConnecterLink.href = "/deconnexion.js";
      }
    }
}

activerMenusSiConnecte();
// auth_menu.js - Active les menus disabled après connexion

function activerMenusConnecte() {
  const user = sessionStorage.getItem('user') || localStorage.getItem('user');
  
  if (!user) return;

  // Active tous les liens disabled de la nav
  document.querySelectorAll('nav a.disabled').forEach(lien => {
    lien.classList.remove('disabled');
    lien.removeAttribute('aria-disabled');
    lien.removeAttribute('tabindex');
  });

  // Remplace "Se connecter" par "Mon compte" + "Se déconnecter"
  const lienConnexion = document.querySelector('nav a.seconnecter');
  if (lienConnexion) {
    const li = lienConnexion.parentElement;

    li.innerHTML = `<a href="mon-compte.html">Mon compte</a>`;

    // Ajoute un bouton déconnexion après
    const liDeconnexion = document.createElement('li');
    liDeconnexion.innerHTML = `<a href="#" id="btn-deconnexion">Se déconnecter</a>`;
    li.after(liDeconnexion);

    document.getElementById('btn-deconnexion').addEventListener('click', (e) => {
      e.preventDefault();
      deconnecterUtilisateur();
    });
  }
}

function deconnecterUtilisateur() {
  sessionStorage.removeItem('user');
  localStorage.removeItem('user');
  window.location.reload();
}

// Lancement au chargement du DOM
document.addEventListener('DOMContentLoaded', activerMenusConnecte);
