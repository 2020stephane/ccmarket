//===========================================================
//    FICHIER : rechercher.js
//    PROJET  : ccmarket
//    DATE    : 18/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
import { verifierConnection } from "/js/tools/authentification.js";
verifierConnection();

const form = document.querySelector('form');
    const formData = new FormData(form);

    // Conversion du formulaire en objet JSON
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/api/annonces/recherche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const resultats = await response.json();

    // On stocke le résultat en texte dans le navigateur
    localStorage.setItem('mesResultats', JSON.stringify(resultats));

    // On change de page manuellement
    window.location.href = '/resultat_recherche.html';
