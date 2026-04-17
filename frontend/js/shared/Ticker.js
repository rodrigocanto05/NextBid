// Live auctions ticker bar
window.NB = window.NB || {};

NB.initTicker = function () {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    NB.apiGet('/api/auctions/get_active.php')
        .then(data => {
            const list = (data.auctions || []).slice(0, 8);
            if (!list.length) {
                track.innerHTML = `<span class="ticker__item">
                    <span class="ticker__dot"></span>
                    <span class="ticker__live">NextBid</span>
                    <span class="ticker__name">Sem leilões ativos no momento</span>
                </span>`;
                return;
            }
            const items = list.map(a => `
                <span class="ticker__item">
                    <span class="ticker__dot"></span>
                    <span class="ticker__live">AO VIVO</span>
                    <span class="ticker__name">${NB.escHtml(a.prd_name)}</span>
                    <span class="ticker__sep">•</span>
                    <span class="ticker__amount">${NB.formatCurrency(a.current_bid || a.prd_start_price)}</span>
                </span>`).join('');
            track.innerHTML = items + items; // duplicate for seamless scroll
        })
        .catch(() => {
            track.innerHTML = `<span class="ticker__item">
                <span class="ticker__dot"></span>
                <span class="ticker__live">Offline</span>
            </span>`;
        });
};
