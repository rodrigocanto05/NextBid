// Os Meus Leilões page — stats + tabs Ativo / Passado
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        NB.renderNavbar();
        NB.initTicker();

        const user = NB.getCurrentUser();
        if (!user) { showLoginPrompt(); return; }

        NB.NovoLeilao.init(() => { loadActive(); loadStats(); });
        bindTabs();
        loadStats();
        loadActive();
        loadPast();
    });

    function bindTabs() {
        document.querySelectorAll('.tab').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                document.querySelectorAll('.tab').forEach(t => t.classList.toggle('tab--active', t === btn));
                document.querySelectorAll('.tab-panel').forEach(p =>
                    p.classList.toggle('active', p.id === `panel-${target}`));
            });
        });
    }

    function loadStats() {
        const user = NB.getCurrentUser();
        if (!user) return;

        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        setText('stat-xp', (user.xp ?? 0).toLocaleString('pt-PT'));
        const lvl = Math.floor(Math.sqrt((user.xp ?? 0) / 100)) + 1;
        setText('stat-level', lvl);

        NB.apiGet(`/api/user/profile.php?user_id=${user.id}`)
            .then(res => {
                const p = res?.data;
                if (p) setText('stat-balance', NB.formatCurrency(p.usr_balance));
            }).catch(() => {});

        NB.apiGet('/api/auctions/my_won.php')
            .then(res => setText('stat-won', (res.auctions || []).length))
            .catch(() => {});

        NB.apiGet('/api/bids/my_bids.php?limit=500')
            .then(res => {
                const total = (res.bids || []).reduce((s, b) => s + Number(b.bid_amount || 0), 0);
                setText('stat-bids', NB.formatCurrency(total));
            }).catch(() => {});
    }

    function loadActive() {
        NB.apiGet('/api/auctions/my_selling.php').then(data => {
            NB.renderGrid('grid-ativo', data.auctions || [], { emptyText: 'Ainda não tens leilões ativos.' });
        }).catch(() => {});
    }

    function loadPast() {
        NB.apiGet('/api/auctions/my_won.php').then(data => {
            const me = NB.getCurrentUser()?.id;
            const list = (data.auctions || []).map(a => ({
                ...a,
                _result: a.prd_winner_usr_id === me ? 'sold' : 'unsold'
            }));
            const grid = document.getElementById('grid-passado');
            if (!grid) return;
            grid.innerHTML = '';
            if (!list.length) {
                grid.innerHTML = '<div class="cards-empty">Ainda não tens leilões passados.</div>';
                return;
            }
            list.forEach(a => grid.appendChild(NB.createCard(a, { past: true, resultBadge: a._result })));
        }).catch(() => {});
    }

    function showLoginPrompt() {
        document.getElementById('auth-content').innerHTML = '';
        document.getElementById('login-prompt').style.display = '';
    }
})();
