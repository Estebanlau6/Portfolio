function bootstrapPage() {
    // Note: Plus de initTheme() ici, on a un thème unique
    initCertifications();
    initPagination();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapPage);
} else {
    bootstrapPage();
}

// Recalcule la pagination quand la page revient du cache navigateur (bfcache).
window.addEventListener('pageshow', () => {
    initPagination();
});

/* ==========================================================================
   GESTION DES CERTIFICATIONS (Index.html / Realisations.html)
   ========================================================================== */
function initCertifications() {
    // Cible tous les boutons qui ouvrent une galerie non-modale (dropdown dans la page)
    const certifButtons = document.querySelectorAll('.btn-certif[data-target]');
    
    if (certifButtons.length === 0) return;

    certifButtons.forEach(button => {
        if (button.dataset.certifBound === '1') return;
        button.dataset.certifBound = '1';

        button.addEventListener('click', (e) => {
            // Si c'est un lien, on empêche la navigation
            // (Note: pour des boutons <button>, e.preventDefault n'est pas nécessaire par défaut sauf form submit)
            if (button.tagName === 'A') {
                e.preventDefault();
            }

            const targetId = button.getAttribute('data-target');
            if (!targetId) return;

            // Trouver la galerie correspondante
            const targetGallery = document.querySelector(`.pdf-gallery[data-gallery="${targetId}"]`);
            if (!targetGallery) return;

            // Gestion de l'état (Toggle)
            const isHidden = targetGallery.classList.contains('hidden');

            // Fermer toutes les autres galeries d'abord pour garder la page propre (optionnel mais recommandé PRO)
            document.querySelectorAll('.pdf-gallery').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.btn-certif[data-target]').forEach(btn => {
                // Remet le texte par défaut "Voir" ou icône si nécessaire.
                if(btn.tagName === 'BUTTON') {
                   // Si le bouton avait un icone, attention à ne pas l'écraser bêtement par du texte brut
                   // Ici on fait simple cas : s'il a une classe fa-..., on pourrait vouloir basculer l'icone
                   // Mais pour l'instant on laisse tel quel ou on change juste le texte si c'est un bouton texte.
                   // Pour simplifier : on ne change pas le texte du bouton ici pour éviter de casser le markup icon
                   // sauf si on veut explicitement afficher "Fermer".
                   // On va plutôt toggler une classe .active sur le bouton pour le styling
                   btn.classList.remove('active');
                }
            });

            if (isHidden) {
                targetGallery.classList.remove('hidden');
                button.classList.add('active');
            } else {
                // Si c'était déjà ouvert, on le laisse fermé (déjà fait par le clean all au dessus)
                button.classList.remove('active');
            }
        });
    });
}


/* ==========================================================================
   GESTION DE LA PAGINATION (Veille.html)
   ========================================================================== */
function initPagination() {
    const newsContainer = document.getElementById('news-container');
    const paginationContainer = document.querySelector('.pagination-container');

    if (!newsContainer || !paginationContainer) return;

    const newsItems = Array.from(newsContainer.querySelectorAll('.news-item'));
    if (newsItems.length === 0) return;

    const itemsPerPage = Number(newsContainer.dataset.itemsPerPage || 6);
    const totalPages = Math.ceil(newsItems.length / itemsPerPage);

    // Stocke un etat unique de pagination pour eviter toute derive d'attributs HTML.
    window.__newsPagination = {
        items: newsItems,
        itemsPerPage,
        totalPages
    };

    // Regenere les boutons selon les pages qui ont vraiment du contenu.
    paginationContainer.innerHTML = '';

    for (let page = 1; page <= totalPages; page++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `page-btn${page === 1 ? ' active' : ''}`;
        btn.textContent = String(page);
        btn.dataset.pageBtn = String(page);
        btn.addEventListener('click', () => updatePageDisplay(page));
        paginationContainer.appendChild(btn);
    }

    updatePageDisplay(1);
}

// Fonction logique d'affichage 
function updatePageDisplay(pageNumber) {
    const state = window.__newsPagination;
    if (!state || !Array.isArray(state.items) || state.items.length === 0) return;

    const clampedPage = Math.min(Math.max(Number(pageNumber) || 1, 1), state.totalPages);
    const start = (clampedPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;

    // 1. Masquer tous les items
    state.items.forEach(item => {
        item.style.display = 'none';
    });

    // 2. Afficher les items de la page calculee par index
    state.items.slice(start, end).forEach(item => {
        item.style.display = 'flex';
    });

    // 3. Mettre à jour l'état actif des boutons
    const buttons = document.querySelectorAll('.page-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.querySelector(`.page-btn[data-page-btn="${clampedPage}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

// Global scope pour compatibilité legacy
window.showPage = updatePageDisplay;
