const BASE_URL = 'http://localhost/NextBid';

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    atualizarNavbar();
    carregarLeiloes();
    iniciarTicker();
});

// ─── Navbar: mostrar nome do utilizador se logged in ─────────────────────────

function atualizarNavbar() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const authEl = document.getElementById('navbar-auth');
    if (!authEl) return;

    if (user) {
        authEl.innerHTML = `
            <span style="color:#ccc; font-size:0.9rem">Olá, <strong style="color:#C9A84C">${user.name}</strong></span>
            <a href="Perfil.html"><button class="btn btn--outline">Perfil</button></a>
            <button class="btn btn--outline" id="btn-logout">Sair</button>
        `;
        document.getElementById('btn-logout').addEventListener('click', function () {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            location.reload();
        });
    } else {
        authEl.innerHTML = `
            <a href="auth/Login.html"><button class="btn btn--outline">Login</button></a>
            <a href="auth/Register.html"><button class="btn btn--primary">Registar</button></a>
        `;
    }
}

// ─── Leilões: carregar e renderizar cards ────────────────────────────────────

async function carregarLeiloes() {
    const grid = document.getElementById('auctions-grid');
    if (!grid) return;

    let url = `${BASE_URL}/api/auctions/get_active.php`;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchEMostrar(url + `?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`, grid),
            ()  => fetchEMostrar(url, grid)
        );
    } else {
        fetchEMostrar(url, grid);
    }
}

async function fetchEMostrar(url, grid) {
    try {
        const res  = await fetch(url);
        const data = await res.json();

        grid.innerHTML = '';

        if (data.status === 'success' && data.data.length > 0) {
            data.data.forEach(leilao => grid.appendChild(criarCard(leilao)));
            atualizarStats(data.count);
        } else {
            grid.innerHTML = '<div class="empty-state"><p>Nenhum leilão ativo de momento.</p></div>';
        }
    } catch {
        grid.innerHTML = '<div class="empty-state"><p>Erro ao carregar leilões.</p></div>';
    }
}

function criarCard(leilao) {
    const article = document.createElement('article');
    article.className = 'auction-card';

    const distanciaHtml = leilao.distance
        ? `<span class="auction-card__condition">📍 ${parseFloat(leilao.distance).toFixed(1)} km</span>`
        : '';

    article.innerHTML = `
        <div class="auction-card__img">Sem imagem</div>
        <div class="auction-card__body">
            <p class="auction-card__title">${leilao.prd_name}</p>
            <p class="auction-card__desc">${leilao.prd_description || ''}</p>
            <p class="auction-card__price">${parseFloat(leilao.prd_start_price).toFixed(2)} €</p>
            <p class="auction-card__condition">${leilao.prd_condition || ''}</p>
            ${distanciaHtml}
            <p class="auction-card__timer">⏱ <span id="timer-${leilao.prd_id}">...</span></p>
        </div>
        <div class="auction-card__footer">
            <a href="LL active/MesaLicitacoes.html?product_id=${leilao.prd_id}">
                <button class="btn btn--primary">Licitar</button>
            </a>
        </div>
    `;

    if (leilao.prd_ends_at) {
        iniciarCronometro(leilao.prd_ends_at, article.querySelector(`#timer-${leilao.prd_id}`));
    }

    return article;
}

function atualizarStats(total) {
    const el = document.getElementById('stat-ativos');
    if (el) el.textContent = total;
}

// ─── Ticker de licitações ao vivo ────────────────────────────────────────────

async function iniciarTicker() {
    await atualizarTicker();
    setInterval(atualizarTicker, 15000); // atualiza a cada 15 segundos
}

async function atualizarTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    try {
        const res  = await fetch(`${BASE_URL}/api/auctions/get_active.php`);
        const data = await res.json();

        if (data.status === 'success' && data.data.length > 0) {
            // Duplicar os itens para o efeito de loop contínuo
            const itens = data.data.map(l =>
                `<span class="ticker__item">${l.prd_name} — Lance a partir de ${parseFloat(l.prd_start_price).toFixed(2)} €</span>`
            ).join('');

            track.innerHTML = itens + itens; // duplicado para animação contínua
        }
    } catch {
        // mantém o ticker com o conteúdo anterior em caso de erro
    }
}
