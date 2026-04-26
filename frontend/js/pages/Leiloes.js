// Todos os Leilões page wire-up
(function () {
    let allAuctions = [];
    let getFilters;

    document.addEventListener('DOMContentLoaded', () => {
        NB.renderNavbar();
        NB.initTicker();
        NB.loadCategoriesInto('filter-category');
        getFilters = NB.initFilterBar(apply);
        NB.NovoLeilao.init(loadAuctions);

        loadAuctions();
    });

    function loadAuctions() {
        NB.apiGet('/api/auctions/get_active.php')
            .then(data => {
                allAuctions = data.auctions || [];
                apply();
            })
            .catch(() => {
                const el = document.getElementById('cards-loading');
                if (el) el.innerHTML = '<p>Erro ao carregar leilões.</p>';
            });
    }

    function apply() {
        const filtered = NB.filterAuctions(allAuctions, getFilters());
        NB.renderGrid('leiloes-container', filtered);
    }

})();
