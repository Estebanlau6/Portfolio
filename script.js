document.addEventListener('DOMContentLoaded', () => {
    // Note: Plus de initTheme() ici, on a un thème unique
    
    // Initialiser les galeries de certificats s'il y en a
    initCertifications();

    // Initialiser la pagination s'il y en a
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
    const pageButtons = document.querySelectorAll('.page-btn');
    if (pageButtons.length === 0) return;

    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Récupérer le numéro de page depuis le texte du bouton ou un attribut data
            // (Ici on assume que le texte du bouton est "1", "2", etc.)
            const pageNumber = this.textContent.trim();
            // Appeler la logique d'affichage
            updatePageDisplay(pageNumber);
        });
    });
}

// Fonction logique d'affichage 
function updatePageDisplay(pageNumber) {
    // 1. Masquer tous les items
    const allNews = document.querySelectorAll('.news-item');
    allNews.forEach(item => item.style.display = 'none');

    // 2. Afficher les items de la target
    // Astuce: Si data-page="1", on affiche. 
    // Attention: Si on a plusieurs items par page, ils auront tous data-page="1"
    const targetNews = document.querySelectorAll(`.news-item[data-page="${pageNumber}"]`);
    targetNews.forEach(item => item.style.display = 'flex'); 

    // 3. Mettre à jour l'état actif des boutons
    const buttons = document.querySelectorAll('.page-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // On cherche le bouton qui correspond au numéro cliqué pour l'activer
    buttons.forEach(btn => {
        if (btn.textContent.trim() === String(pageNumber)) {
            btn.classList.add('active');
        }
    });
}

// Global scope pour compatibilité legacy
window.showPage = updatePageDisplay;
