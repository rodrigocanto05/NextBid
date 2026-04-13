// Requer Leaflet.js carregado antes deste script:
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
// <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

const BASE_URL = 'http://localhost/NextBid';
let mapa = null;

document.addEventListener('DOMContentLoaded', function () {
    const mapaEl = document.getElementById('mapa-leiloes');
    if (!mapaEl) return;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => iniciarMapaComLeiloes(pos.coords.latitude, pos.coords.longitude),
            ()  => iniciarMapaComLeiloes(38.7169, -9.1399) // fallback: Lisboa
        );
    } else {
        iniciarMapaComLeiloes(38.7169, -9.1399);
    }
});

function iniciarMapa(lat, lng) {
    if (mapa) mapa.remove();
    mapa = L.map('mapa-leiloes').setView([lat, lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
    return mapa;
}

async function iniciarMapaComLeiloes(lat, lng) {
    const map = iniciarMapa(lat, lng);

    // Marcador da localização do utilizador
    L.marker([lat, lng])
        .addTo(map)
        .bindPopup('A tua localização')
        .openPopup();

    try {
        const res = await fetch(`${BASE_URL}/api/auctions/get_active.php?lat=${lat}&lng=${lng}`);
        const data = await res.json();

        if (data.status === 'success') {
            data.data.forEach(leilao => {
                if (leilao.prd_latitude && leilao.prd_longitude) {
                    const distanciaTexto = leilao.distance
                        ? `<br>Distância: ${parseFloat(leilao.distance).toFixed(1)} km`
                        : '';

                    L.marker([parseFloat(leilao.prd_latitude), parseFloat(leilao.prd_longitude)])
                        .addTo(map)
                        .bindPopup(`
                            <strong>${leilao.prd_name}</strong><br>
                            Preço inicial: ${parseFloat(leilao.prd_start_price).toFixed(2)} €
                            ${distanciaTexto}<br>
                            <a href="/frontend/hmtl/LL active/MesaLicitacoes.html?product_id=${leilao.prd_id}">Licitar</a>
                        `);
                }
            });
        }
    } catch (err) {
        console.error('Erro ao carregar leilões no mapa:', err);
    }
}
