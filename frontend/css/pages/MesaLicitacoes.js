const BASE_URL = 'http://localhost/NextBid/backend';

const params = new URLSearchParams(window.location.search);
const productId = params.get('product_id');

document.addEventListener('DOMContentLoaded', function () {
    if (!productId) {
        const main = document.querySelector('main');
        if (main) main.innerHTML = '<p>Leilão não encontrado. <a href="/frontend/hmtl/LL active/LeiloesAtivos.html">Ver leilões</a></p>';
        return;
    }
    carregarInfoLeilao();
});

async function carregarInfoLeilao() {
    try {
        const res = await fetch(`${BASE_URL}/api/auctions/get_active.php`);
        const data = await res.json();

        if (data.status === 'success') {
            const leilao = data.data.find(l => String(l.prd_id) === String(productId));
            if (leilao) {
                mostrarInfoLeilao(leilao);
            } else {
                document.querySelector('main').innerHTML = '<p>Leilão não encontrado ou já encerrado.</p>';
            }
        }
    } catch (err) {
        console.error('Erro ao carregar leilão:', err);
    }
}

function mostrarInfoLeilao(leilao) {
    const nomeEl = document.getElementById('produto-nome');
    const descEl = document.getElementById('produto-descricao');
    const precoEl = document.getElementById('lance-minimo');
    const timerEl = document.getElementById('cronometro');

    if (nomeEl) nomeEl.textContent = leilao.prd_name;
    if (descEl) descEl.textContent = leilao.prd_description || '';
    if (precoEl) precoEl.textContent = parseFloat(leilao.prd_start_price).toFixed(2) + ' €';
    if (timerEl && leilao.prd_ends_at) iniciarCronometro(leilao.prd_ends_at, timerEl);
}

document.getElementById('form-licitar')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        alert('Tens de fazer login para licitar.');
        window.location.href = "auth/Login.html";
        return;
    }

    const amount = parseFloat(document.getElementById('bid-amount').value);
    if (!amount || amount <= 0) {
        mostrarMensagem('Insere um valor válido.', 'red');
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/bids/place.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, product_id: productId, amount })
        });

        const data = await res.json();

        if (data.status === 'success') {
            mostrarMensagem(`Licitação efetuada com sucesso! +${data.xp_ganho} XP`, 'green');
            document.getElementById('bid-amount').value = '';
            carregarInfoLeilao();
        } else {
            mostrarMensagem(data.message || 'Erro ao licitar.', 'red');
        }
    } catch (err) {
        mostrarMensagem('Erro de ligação ao servidor.', 'red');
    }
});

function mostrarMensagem(msg, cor) {
    let el = document.getElementById('licitar-msg');
    if (!el) {
        el = document.createElement('p');
        el.id = 'licitar-msg';
        document.getElementById('form-licitar')?.appendChild(el);
    }
    el.style.color = cor;
    el.textContent = msg;
}
