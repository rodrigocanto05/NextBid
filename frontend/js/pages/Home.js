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
            })
            .catch(() => {
                const el = document.getElementById('cards-loading');
                if (el) el.innerHTML = '<p>Erro ao carregar leilões.</p>';
            });
    }
})();
