const btnHamburger = document.querySelector(".btn-hamburger");
const nav = document.querySelector("header nav");

// --- LOGIQUE DE FERMETURE ---
const closeMenu = () => {
  nav.classList.remove("is-open");
  btnHamburger.classList.remove("is-open");
  btnHamburger.setAttribute("aria-expanded", "false");
};

// --- LOGIQUE D'OUVERTURE ---
const openMenu = () => {
  nav.classList.add("is-open");
  btnHamburger.classList.add("is-open");
  btnHamburger.setAttribute("aria-expanded", "true");
};

// --- GESTIONNAIRE D'ÉVÉNEMENTS ---

// Clic sur le bouton : on vérifie l'état actuel pour savoir quoi faire
btnHamburger.addEventListener("click", () => {
  const isOpened = btnHamburger.getAttribute("aria-expanded") === "true";
  isOpened ? closeMenu() : openMenu();
});

// Fermeture au clic extérieur
document.addEventListener("click", (e) => {
  if (!e.target.closest("header")) {
    closeMenu();
  }
});

// Fermeture au clic sur un lien
document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Fermeture avec la touche Échap (Bonus Accessibilité)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
  }
});