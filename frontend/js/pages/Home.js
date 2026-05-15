// Home / index page wire-up
(function () {
    const REFRESH_MS = 15000;
    let refreshTimer = null;

    document.addEventListener('DOMContentLoaded', () => {
        NB.renderNavbar();
        NB.showWelcomeIfPending();
        NB.initHeroCarousel();
        NB.initTicker();
        loadFeatured();
        refreshTimer = setInterval(loadFeatured, REFRESH_MS);
    });

    function loadFeatured() {
        NB.apiGet('/api/auctions/get_active.php')
            .then(data => {
                const list = (data.auctions || []).slice(0, 8); // featured = first 8
                NB.renderGrid('leiloes-container', list);
                appendMoreCard();
            })
            .catch(() => {
                const el = document.getElementById('cards-loading');
                if (el) el.innerHTML = '<p>Erro ao carregar leilões.</p>';
            });
    }

    // Appends a "+" card linking to the full auctions page so users can jump
    // straight from the homepage grid into LeiloesAtivos.
    function appendMoreCard() {
        const grid = document.getElementById('leiloes-container');
        if (!grid || grid.querySelector('.auction-card--more')) return;

        const a = document.createElement('a');
        a.className = 'auction-card auction-card--more';
        a.href = 'leiloes/LeiloesAtivos.html';
        a.setAttribute('aria-label', 'Ver todos os leilões');
        a.innerHTML = `
            <div class="auction-card--more__inner">
                <span class="auction-card--more__plus" aria-hidden="true">+</span>
                <span class="auction-card--more__label">Ver todos os leilões</span>
                <span class="auction-card--more__hint">Explora a lista completa</span>
            </div>`;
        grid.appendChild(a);
    }
})();
