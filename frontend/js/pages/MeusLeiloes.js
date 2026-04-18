// Os Meus Leilões — 3 stat cards + Ativo/Passado tabs
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        NB.renderNavbar();
        NB.initTicker();

        const user = NB.getCurrentUser();
        if (!user) { showLoginPrompt(); return; }

        NB.NovoLeilao.init(() => { loadAll(); });
        bindTabs();
        loadAll();
    });

    function bindTabs() {
        document.querySelectorAll('.tab').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                document.querySelectorAll('.tab').forEach(t =>
                    t.classList.toggle('tab--active', t === btn));
                document.querySelectorAll('.tab-panel').forEach(p =>
                    p.classList.toggle('active', p.id === `panel-${target}`));
            });
        });
    }

    function loadAll() {
        Promise.all([
            NB.apiGet('/api/auctions/my_selling.php').catch(() => ({ auctions: [] })),
            NB.apiGet('/api/auctions/my_won.php').catch(() => ({ auctions: [] }))
        ]).then(([sellingRes, wonRes]) => {
            const selling = sellingRes.auctions || [];
            const past    = wonRes.auctions || [];

            const active = selling.filter(a => (a.prd_status || '').toLowerCase() === 'active');
            const sold   = selling.filter(a => (a.prd_status || '').toLowerCase() === 'sold');
            const total  = sold.reduce((s, a) =>
                s + Number(a.prd_current_price ?? a.prd_start_price ?? 0), 0);

            setText('stat-active', active.length);
            setText('stat-sold',   sold.length);
            setText('stat-total',  NB.formatCurrency(total));

            setText('tab-ativo',   `Leilões Ativos (${active.length})`);
            setText('tab-passado', `Histórico (${past.length})`);

            renderGrid('grid-ativo', active, 'Ainda não tens leilões ativos.');
            renderPast('grid-passado', past);
        });
    }

    function renderGrid(id, list, emptyText) {
        const grid = document.getElementById(id);
        if (!grid) return;
        grid.innerHTML = '';
        if (!list.length) { grid.innerHTML = `<div class="cards-empty">${emptyText}</div>`; return; }
        list.forEach(a => grid.appendChild(NB.createCard(a)));
    }

    function renderPast(id, list) {
        const grid = document.getElementById(id);
        if (!grid) return;
        grid.innerHTML = '';
        if (!list.length) {
            grid.innerHTML = '<div class="cards-empty">Ainda não tens leilões passados.</div>';
            return;
        }
        const me = NB.getCurrentUser()?.id;
        list.forEach(a => {
            const result = a.prd_winner_usr_id && Number(a.prd_winner_usr_id) === Number(me) ? 'sold' : 'unsold';
            grid.appendChild(NB.createCard(a, { past: true, resultBadge: result }));
        });
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function showLoginPrompt() {
        document.getElementById('auth-content').style.display = 'none';
        document.getElementById('login-prompt').style.display = '';
    }
})();
