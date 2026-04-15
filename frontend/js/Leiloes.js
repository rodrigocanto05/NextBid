const BASE_URL = 'http://localhost/NextBid/backend';

document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('leiloes-container');
    if (!container) return;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchLeiloes(pos.coords.latitude, pos.coords.longitude, container),
            ()  => fetchLeiloes(null, null, container)
        );
    } else {
        fetchLeiloes(null, null, container);
    }
});

async function fetchLeiloes(lat, lng, container) {
    let url = `${BASE_URL}/api/auctions/get_active.php`;
    if (lat && lng) url += `?lat=${lat}&lng=${lng}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'success' && data.data.length > 0) {
            container.innerHTML = '';
            data.data.forEach(leilao => container.appendChild(criarCardLeilao(leilao)));
        } else {
            container.innerHTML = '<p>Nenhum leilão ativo de momento.</p>';
        }
    } catch (err) {
        container.innerHTML = '<p>Erro ao carregar leilões. Tenta novamente.</p>';
    }
}

function criarCardLeilao(leilao) {
    const div = document.createElement('div');
    div.className = 'leilao-card';
    div.style.cssText = 'border:1px solid #ccc; padding:12px; margin:8px 0; border-radius:6px;';

    const distancia = leilao.distance
        ? `<p><strong>Distância:</strong> ${parseFloat(leilao.distance).toFixed(1)} km</p>`
        : '';

    div.innerHTML = `
        <h3>${leilao.prd_name}</h3>
        <p>${leilao.prd_description || ''}</p>
        <p><strong>Preço inicial:</strong> ${parseFloat(leilao.prd_start_price).toFixed(2)} €</p>
        <p><strong>Condição:</strong> ${leilao.prd_condition || 'N/D'}</p>
        ${distancia}
        <p><strong>Tempo restante:</strong> <span id="timer-${leilao.prd_id}">...</span></p>
        <a href="/frontend/hmtl/LL active/MesaLicitacoes.html?product_id=${leilao.prd_id}">Licitar</a>
    `;

    if (leilao.prd_ends_at) {
        iniciarCronometro(leilao.prd_ends_at, div.querySelector(`#timer-${leilao.prd_id}`));
    }

    return div;
}
