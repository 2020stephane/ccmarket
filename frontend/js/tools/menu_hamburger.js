//===========================================================
//    FICHIER : menu_hamburger.js
//    PROJET  : ccmarket
//    DATE    : 02/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
const btnHamburger = document.querySelector(".btn-hamburger");
const nav = document.querySelector(".nav-links");

const closeMenu = () => {
  nav.classList.remove("is-open");
  btnHamburger.classList.remove("is-open");
  btnHamburger.setAttribute("aria-expanded", "false");
};
const openMenu = () => {
  nav.classList.add("is-open");
  btnHamburger.classList.add("is-open");
  btnHamburger.setAttribute("aria-expanded", "true");
};
// ==================================================
// GESTIONNAIRE D'ÉVÉNEMENTS
// ==================================================
btnHamburger.addEventListener("click", () => {
  const isOpened = btnHamburger.getAttribute("aria-expanded") === "true";
  isOpened ? closeMenu() : openMenu();
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("header")) {
    closeMenu();
  }
});
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
  }
});
