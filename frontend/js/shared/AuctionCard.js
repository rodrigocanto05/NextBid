// Auction card builder (reusable for Home / Leiloes / MeusLeiloes)
window.NB = window.NB || {};

NB.createCard = function (leilao, opts = {}) {
    const imgUrl = leilao.main_image
        ? `${NB.BASE_URL}/uploads/${leilao.main_image}`
        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=70';

    const detailLink = NB._path(`LL active/LeilaoAtivox.html?id=${leilao.prd_id}`);
    const card = document.createElement('article');
    card.className = 'auction-card';

    const resultBadge = opts.resultBadge ? `
        <span class="auction-card__result-badge result-badge result-badge--${opts.resultBadge}">
            ${opts.resultBadge === 'sold' ? '✓ Vendido' : '✕ Não vendido'}
        </span>` : '';

    const bottom = opts.past ? `
        <div class="auction-card__label">${opts.resultBadge === 'sold' ? 'Valor final' : 'Lance mais alto'}</div>
        <div class="auction-card__price">${NB.formatCurrency(leilao.current_bid || leilao.prd_start_price)}</div>
    ` : `
        <div class="auction-card__bid-row">
            <div>
                <span class="auction-card__label">Licitação atual</span>
                <span class="auction-card__price">${NB.formatCurrency(leilao.current_bid || leilao.prd_start_price)}</span>
            </div>
            <div class="auction-card__timer">
                <span class="auction-card__label">Termina em</span>
                <span class="timer-value" data-ends="${NB.escHtml(leilao.prd_ends_at || '')}">–</span>
            </div>
        </div>`;

    card.innerHTML = `
        <div class="auction-card__img-wrap">
            <img class="auction-card__img" src="${NB.escHtml(imgUrl)}" alt="${NB.escHtml(leilao.prd_name)}" loading="lazy" />
            <span class="auction-card__cat-badge">${NB.escHtml(leilao.cat_name || '')}</span>
            ${resultBadge}
        </div>
        <div class="auction-card__body">
            <h3 class="auction-card__title">${NB.escHtml(leilao.prd_name)}</h3>
            <p class="auction-card__owner">👤 ${NB.escHtml(leilao.usr_username || leilao.owner || '')}</p>
            ${bottom}
        </div>
        <div class="auction-card__footer">
            <a href="${detailLink}" class="btn btn--primary btn--full">${opts.past ? 'Ver Detalhes' : 'Licitar'}</a>
        </div>`;

    // Start countdown
    const timerEl = card.querySelector('.timer-value');
    if (!opts.past && leilao.prd_ends_at && timerEl && typeof NB.iniciarCronometro === 'function') {
        NB.iniciarCronometro(leilao.prd_ends_at, timerEl);
    }

    return card;
};
