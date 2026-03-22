// fonction en js
document.addEventListener('DOMContentLoaded', async () => {
    const liste = document.querySelector('.produits-grid');

    try {
        const response = await fetch('http://localhost:3000/api/annonces/derniers-ajouts');

        if (!response.ok) throw new Error('Erreur réseau');

        const annonces = await response.json();

        if (annonces.length === 0) {
            liste.innerHTML = '<li>Aucune annonce pour le moment.</li>';
            return;
        }

        annonces.forEach(annonce => {
            const li = document.createElement('li');
            li.className = 'produit-card';
            li.innerHTML = `
                <img src="${annonce.image_url || '../img/placeholder.png'}" alt="${annonce.titre}">
                <div class="produit-info">
                    <h3>${annonce.titre}</h3>
                    <p class="produit-prix">${annonce.prix} €</p>
                    <p class="produit-categorie">${annonce.categorie}</p>
                </div>
            `;
            liste.appendChild(li);
        });

    } catch (error) {
        console.error('Impossible de charger les annonces :', error);
        liste.innerHTML = '<li>Impossible de charger les annonces.</li>';
    }
});