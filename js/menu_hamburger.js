const btnHamburger = document.querySelector('.btn-hamburger');
  const nav = document.querySelector('header nav');

  btnHamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    btnHamburger.classList.toggle('is-open');

    // Accessibilité : met à jour aria-expanded
    btnHamburger.setAttribute('aria-expanded', isOpen);
  });

  // Ferme le menu si on clique en dehors
  document.addEventListener('click', (e) => {
    if (!e.target.closest('header')) {
      nav.classList.remove('is-open');
      btnHamburger.classList.remove('is-open');
      btnHamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Ferme le menu si on clique sur un lien
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      btnHamburger.classList.remove('is-open');
      btnHamburger.setAttribute('aria-expanded', 'false');
    });
  });