const BASE_URL = 'http://localhost/NextBid/backend';

document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('main');
    if (!container) return;

    if (!navigator.geolocation) {
        container.innerHTML = '<p>O teu browser não suporta geolocalização.</p>';
        return;
    }

    container.innerHTML = '<p>A obter localização...</p>';

    navigator.geolocation.getCurrentPosition(
        pos => carregarTesouros(pos.coords.latitude, pos.coords.longitude, container),
        ()  => { container.innerHTML = '<p>Não foi possível obter a tua localização. Ativa o GPS e recarrega a página.</p>'; }
    );
});

async function carregarTesouros(lat, lng, container) {
    try {
        const res = await fetch(`${BASE_URL}/api/gamification/get_nearby.php?lat=${lat}&lng=${lng}&radius=10`);
        const data = await res.json();

        if (data.status === 'success' && data.data.length > 0) {
            container.innerHTML = '';
            data.data.forEach(tesouro => {
                container.appendChild(criarCardTesouro(tesouro, lat, lng));
            });
        } else {
            container.innerHTML = '<p>Não há tesouros perto de ti de momento. Tenta mais tarde!</p>';
        }
    } catch (err) {
        container.innerHTML = '<p>Erro ao carregar tesouros. Tenta novamente.</p>';
    }
}

function criarCardTesouro(tesouro, userLat, userLng) {
    const div = document.createElement('div');
    div.className = 'tesouro-card';
    div.style.cssText = 'border:1px solid #ccc; padding:12px; margin:8px 0; border-radius:6px;';

    const distancia = tesouro.distance
        ? `<p><strong>Distância:</strong> ${(parseFloat(tesouro.distance) * 1000).toFixed(0)} m</p>`
        : '';

    div.innerHTML = `
        <h3>${tesouro.gme_name}</h3>
        <p>${tesouro.gme_description || ''}</p>
        <p><strong>Recompensa:</strong> ${tesouro.gme_xp_reward} XP</p>
        ${distancia}
        <button class="btn-reclamar" data-id="${tesouro.gme_id}" data-lat="${userLat}" data-lng="${userLng}">
            Reclamar Tesouro
        </button>
        <p class="tesouro-msg" style="display:none;"></p>
    `;

    div.querySelector('.btn-reclamar').addEventListener('click', reclamarTesouro);
    return div;
}

async function reclamarTesouro(e) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        alert('Tens de fazer login para reclamar tesouros.');
        window.location.href = '/NextBid/frontend/hmtl/auth/Login.html';
        return;
    }

    const btn = e.currentTarget;
    const card = btn.closest('.tesouro-card');
    const msgEl = card.querySelector('.tesouro-msg');
    const pointId = btn.dataset.id;
    const lat = btn.dataset.lat;
    const lng = btn.dataset.lng;

    btn.disabled = true;

    try {
        const res = await fetch(`${BASE_URL}/api/gamification/claim.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, point_id: pointId, lat, lng })
        });

        const data = await res.json();

        msgEl.style.display = 'block';
        msgEl.style.color = data.status === 'success' ? 'green' : 'red';
        msgEl.textContent = data.message || (data.status === 'success' ? 'Tesouro reclamado!' : 'Não foi possível reclamar.');

        if (data.status !== 'success') btn.disabled = false;
    } catch (err) {
        msgEl.style.display = 'block';
        msgEl.style.color = 'red';
        msgEl.textContent = 'Erro de ligação ao servidor.';
        btn.disabled = false;
    }
}
