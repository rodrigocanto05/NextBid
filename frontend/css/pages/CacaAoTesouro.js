// Caça ao Tesouro — mapa Leaflet + tesouros em tempo real + validação por código
// Backend: /api/gamification/{get_active,join,claim_with_code}.php
// Tesouro "a mover-se": polling a cada 10s ao backend + drift aleatório client-side entre polls.

window.NB = window.NB || {};
NB.Caca = {
    map: null,
    userMarker: null,
    userLatLng: null,
    treasures: {},       // id -> { data, marker, anchor:{lat,lng} }
    selectedId: null,
    pollTimer: null,
    animTimer: null,
    ended: false
};

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
    if (typeof NB.renderNavbar === 'function') NB.renderNavbar();
    NB.Caca.initMap();
    NB.Caca.locateUser();
    NB.Caca.wireCodeForm();
    NB.Caca.loadClaimed();
});

// ---------- Mapa ----------
NB.Caca.initMap = function () {
    // attributionControl: false remove o canto inferior direito
    const map = L.map('caca-map', { zoomControl: true, attributionControl: false })
        .setView([38.7169, -9.1399], 13); // Lisboa default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: ''
    }).addTo(map);
    NB.Caca.map = map;
};

// ---------- Status box: só visível enquanto à espera de dados ----------
NB.Caca.setStatus = function (text) {
    const el = document.getElementById('caca-status');
    if (!el) return;
    if (text) { el.textContent = text; el.style.display = 'block'; }
    else      { el.style.display = 'none'; }
};

// ---------- Localização do utilizador ----------
NB.Caca.locateUser = function () {
    if (!navigator.geolocation) {
        NB.Caca.setStatus('O teu browser não suporta geolocalização.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude: lat, longitude: lng } = pos.coords;
            NB.Caca.userLatLng = [lat, lng];
            NB.Caca.map.setView([lat, lng], 15);
            NB.Caca.userMarker = L.circleMarker([lat, lng], {
                radius: 8, color: '#4da3ff', fillColor: '#4da3ff', fillOpacity: 0.8, weight: 2
            }).addTo(NB.Caca.map).bindPopup('Tu estás aqui');
            NB.Caca.setStatus('A procurar tesouros…');
            NB.Caca.loadTreasures();
            NB.Caca.startPolling();
            NB.Caca.startAnimation();
        },
        () => { NB.Caca.setStatus('Ativa o GPS para começar a caça ao tesouro.'); }
    );
};

// ---------- Carregar/atualizar tesouros ----------
NB.Caca.loadTreasures = async function () {
    if (!NB.Caca.userLatLng || NB.Caca.ended) return;
    const [lat, lng] = NB.Caca.userLatLng;
    const resp = await NB.apiGet(`/api/gamification/get_active.php?lat=${lat}&lng=${lng}&radius=50`);

    // Resposta recebida → esconder status (já não estamos à espera de dados)
    NB.Caca.setStatus(null);

    if (resp.status !== 'success' || !Array.isArray(resp.data) || resp.data.length === 0) {
        NB.Caca.clearMarkers();
        return;
    }
    const seen = new Set();
    resp.data.forEach(t => {
        if (t.is_hidden || !t.gme_latitude || !t.gme_longitude) return;
        seen.add(t.gme_id);
        NB.Caca.upsertTreasure(t);
    });
    // remover tesouros que já não vêm no resultado (reclamados/expirados)
    Object.keys(NB.Caca.treasures).forEach(id => {
        if (!seen.has(Number(id))) NB.Caca.removeTreasure(id);
    });
};

NB.Caca.upsertTreasure = function (t) {
    const id = t.gme_id;
    const anchor = { lat: Number(t.gme_latitude), lng: Number(t.gme_longitude) };
    const entry = NB.Caca.treasures[id];

    if (!entry) {
        const icon = L.divIcon({
            className: 'caca-treasure-icon',
            html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 0 4px #d4af37);">💰</div>',
            iconSize: [32, 32], iconAnchor: [16, 16]
        });
        const marker = L.marker([anchor.lat, anchor.lng], { icon }).addTo(NB.Caca.map);
        marker.on('click', () => NB.Caca.selectTreasure(id));
        NB.Caca.treasures[id] = { data: t, marker, anchor };
    } else {
        entry.data = t;
        entry.anchor = anchor;
        entry.marker.setLatLng([anchor.lat, anchor.lng]);
    }
};

NB.Caca.removeTreasure = function (id) {
    const entry = NB.Caca.treasures[id];
    if (!entry) return;
    NB.Caca.map.removeLayer(entry.marker);
    delete NB.Caca.treasures[id];
    if (String(NB.Caca.selectedId) === String(id)) NB.Caca.selectedId = null;
};

NB.Caca.clearMarkers = function () {
    Object.keys(NB.Caca.treasures).forEach(id => NB.Caca.removeTreasure(id));
};

// ---------- Seleção + inscrição automática ----------
NB.Caca.selectTreasure = async function (id) {
    const entry = NB.Caca.treasures[id];
    if (!entry) return;
    NB.Caca.selectedId = id;
    const t = entry.data;

    // Tesouro é sempre mistério — só distância/raio/XP são mostrados (não nome/descrição)
    document.getElementById('caca-info').style.display = 'block';
    document.getElementById('caca-xp').textContent = t.gme_xp_reward || '?';
    document.getElementById('caca-dist').textContent = t.distance
        ? (parseFloat(t.distance) * 1000).toFixed(0)
        : '—';
    document.getElementById('caca-radius').textContent = t.gme_radius || '—';
    document.getElementById('caca-submit').disabled = false;

    // Inscrição automática (silenciosa — ignora erros de "já inscrito")
    const user = NB.getCurrentUser && NB.getCurrentUser();
    if (user && user.token) {
        try {
            await NB.apiPost('/api/gamification/join.php',
                { point_id: id, user_id: user.id }, { auth: true });
        } catch (e) { /* silent */ }
    }
};

// ---------- Polling + animação (ilusão de movimento em tempo real) ----------
NB.Caca.startPolling = function () {
    if (NB.Caca.pollTimer) clearInterval(NB.Caca.pollTimer);
    NB.Caca.pollTimer = setInterval(() => NB.Caca.loadTreasures(), 10000);
};

NB.Caca.startAnimation = function () {
    if (NB.Caca.animTimer) clearInterval(NB.Caca.animTimer);
    NB.Caca.animTimer = setInterval(() => {
        Object.values(NB.Caca.treasures).forEach(entry => {
            // drift aleatório até ~30m à volta do anchor servidor-side
            const dLat = (Math.random() - 0.5) * 0.0006;
            const dLng = (Math.random() - 0.5) * 0.0006;
            entry.marker.setLatLng([entry.anchor.lat + dLat, entry.anchor.lng + dLng]);
        });
    }, 1200);
};

// ---------- Validação do código ----------
NB.Caca.wireCodeForm = function () {
    const form = document.getElementById('caca-code-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (NB.Caca.ended) return;
        const msg = document.getElementById('caca-msg');
        const user = NB.getCurrentUser && NB.getCurrentUser();
        if (!user || !user.token) { msg.style.color = '#ff6b6b'; msg.textContent = 'Tens de fazer login.'; return; }
        if (!NB.Caca.selectedId) { msg.style.color = '#ff6b6b'; msg.textContent = 'Seleciona um tesouro no mapa.'; return; }
        if (!NB.Caca.userLatLng) { msg.style.color = '#ff6b6b'; msg.textContent = 'Sem localização.'; return; }
        const code = document.getElementById('caca-code').value.trim();
        if (!code) { msg.style.color = '#ff6b6b'; msg.textContent = 'Insere o código.'; return; }

        msg.style.color = '#d4af37'; msg.textContent = 'A validar…';
        const [lat, lng] = NB.Caca.userLatLng;
        const resp = await NB.apiPost('/api/gamification/claim_with_code.php',
            { point_id: NB.Caca.selectedId, lat, lng, code }, { auth: true });

        if (resp.status === 'success') {
            msg.style.color = '#4ade80'; msg.textContent = resp.message || 'Código correto!';
            NB.Caca.endHunt(`${user.name || 'Tu'} reclamaste este tesouro!`);
            NB.Caca.loadClaimed(); // refresh "Produtos Encontrados"
        } else {
            msg.style.color = '#ff6b6b';
            msg.textContent = resp.message || 'Código incorreto ou fora do alcance.';
        }
    });
};

// ---------- Produtos encontrados ----------
NB.Caca.loadClaimed = async function () {
    const listEl  = document.getElementById('caca-found-list');
    const emptyEl = document.getElementById('caca-found-empty');
    const user    = NB.getCurrentUser && NB.getCurrentUser();
    if (!listEl) return;
    if (!user || !user.token) {
        emptyEl.textContent = 'Faz login para veres os teus tesouros reclamados.';
        return;
    }
    const resp = await NB.apiGet('/api/gamification/my_claimed.php');
    if (resp.status !== 'success' || !Array.isArray(resp.data) || resp.data.length === 0) {
        emptyEl.textContent = 'Ainda não encontraste tesouros. Insere o código correto para revelar o produto.';
        return;
    }
    // remove placeholder + re-render
    listEl.innerHTML = '';
    resp.data.forEach(item => {
        const prdName = item.prd_name || item.gme_name || 'Produto';
        const when    = item.gcl_claimed_at ? new Date(item.gcl_claimed_at).toLocaleDateString('pt-PT') : '';
        const xp      = item.gme_xp_reward || 0;
        const row = document.createElement('div');
        row.style.cssText = 'padding:10px;border-radius:8px;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.25);';
        row.innerHTML = `
            <div style="font-weight:600;color:#d4af37;font-size:0.92rem;">🎁 ${NB.escHtml(prdName)}</div>
            <div style="font-size:0.78rem;color:#8a8f9c;margin-top:4px;">
                ${NB.escHtml(when)} · +${xp} XP
            </div>`;
        listEl.appendChild(row);
    });
};

// ---------- Fim da caça ----------
NB.Caca.endHunt = function (text) {
    NB.Caca.ended = true;
    if (NB.Caca.pollTimer) clearInterval(NB.Caca.pollTimer);
    if (NB.Caca.animTimer) clearInterval(NB.Caca.animTimer);
    document.getElementById('caca-submit').disabled = true;
    document.getElementById('caca-code').disabled = true;
    const banner = document.getElementById('caca-winner');
    document.getElementById('caca-winner-msg').textContent = text;
    banner.style.display = 'block';
    NB.Caca.clearMarkers();
};
