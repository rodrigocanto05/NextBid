const BASE_URL = 'http://localhost/NextBid/backend';

document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        window.location.href = '/NextBid/frontend/hmtl/auth/Login.html';
        return;
    }

    carregarPerfil(user.id);
    carregarMinhasLicitacoes();
    initAvatarUploader();
});

function initAvatarUploader() {
    const preview = document.getElementById('avatar-preview');
    const fileEl  = document.getElementById('avatar-file');
    const rmBtn   = document.getElementById('avatar-remove');
    const msg     = document.getElementById('avatar-msg');
    if (!preview || !fileEl) return;

    const renderAvatar = () => {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = (u && u.avatar) ? u.avatar : (window.NB && NB.defaultAvatarUrl ? NB.defaultAvatarUrl() : '../img/avatar-placeholder.png');
        img.alt = u?.name || '';
        img.style.width  = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        preview.appendChild(img);
    };
    renderAvatar();

    fileEl.addEventListener('change', () => {
        const file = fileEl.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            if (msg) { msg.style.color = 'red'; msg.textContent = 'Imagem demasiado grande (máx 2 MB).'; }
            fileEl.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const u = JSON.parse(localStorage.getItem('user') || 'null');
            if (!u) return;
            u.avatar = reader.result;
            delete u.token;
            localStorage.setItem('user', JSON.stringify(u));
            renderAvatar();
            if (msg) { msg.style.color = 'green'; msg.textContent = 'Foto atualizada.'; }
        };
        reader.readAsDataURL(file);
    });

    rmBtn?.addEventListener('click', () => {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        if (!u) return;
        delete u.avatar;
        delete u.token;
        localStorage.setItem('user', JSON.stringify(u));
        fileEl.value = '';
        renderAvatar();
        if (msg) { msg.style.color = 'orange'; msg.textContent = 'Foto removida.'; }
    });
}

async function carregarMinhasLicitacoes() {
    const loadingEl = document.getElementById('bids-loading');
    const emptyEl   = document.getElementById('bids-empty');
    const errorEl   = document.getElementById('bids-error');
    const listEl    = document.getElementById('profile-bids-list');
    if (!listEl) return;

    const token = localStorage.getItem('token');
    if (!token) {
        if (loadingEl) loadingEl.hidden = true;
        if (errorEl) {
            errorEl.textContent = 'Sessão inválida. Faz login novamente.';
            errorEl.hidden = false;
        }
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/bids/my_bids.php?limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (loadingEl) loadingEl.hidden = true;

        if (data.status !== 'success') {
            if (errorEl) {
                errorEl.textContent = data.message || 'Erro ao carregar licitações.';
                errorEl.hidden = false;
            }
            return;
        }

        const bids = data.bids || [];
        listEl.innerHTML = '';

        if (!bids.length) {
            if (emptyEl) emptyEl.hidden = false;
            return;
        }

        bids.forEach(b => {
            const li = document.createElement('li');
            const winning = !!b.is_winning;
            const amount  = Number(b.bid_amount || 0).toFixed(2);
            const highest = Number(b.current_highest || 0).toFixed(2);
            const status  = winning ? 'A vencer' : 'Coberto';
            const date    = formatBidDate(b.bid_created_at);
            const prdName = escHtmlLocal(b.prd_name || 'Leilão');
            const prdStatus = escHtmlLocal(b.prd_status || '');
            const prdId  = parseInt(b.prd_id, 10) || 0;

            li.innerHTML =
                `<strong>${prdName}</strong> — ` +
                `A minha oferta: ${amount}€ | Atual: ${highest}€ — ` +
                `<em>${status}</em> ` +
                `<small>(${date} · leilão: ${prdStatus})</small> ` +
                (prdId ? `<a href="../LL active/LeilaoAtivox.html?id=${prdId}">Ver leilão</a>` : '');
            listEl.appendChild(li);
        });
    } catch (err) {
        if (loadingEl) loadingEl.hidden = true;
        if (errorEl) {
            errorEl.textContent = 'Erro de rede ao carregar licitações.';
            errorEl.hidden = false;
        }
        console.error('Erro ao carregar licitações:', err);
    }
}

function escHtmlLocal(str) {
    return String(str || '').replace(/[&<>"']/g, c => (
        { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
    ));
}

function formatBidDate(dt) {
    if (!dt) return '—';
    const d = new Date(String(dt).replace(' ', 'T'));
    if (isNaN(d)) return dt;
    return d.toLocaleString('pt-PT');
}

async function carregarPerfil(userId) {
    try {
        const res = await fetch(`${BASE_URL}/api/user/profile.php?user_id=${userId}`);
        const data = await res.json();

        if (data.status === 'success') {
            const p = data.data;
            document.getElementById('profile-nome').textContent    = p.usr_name  || '';
            document.getElementById('profile-email').textContent   = p.usr_email || '';
            document.getElementById('profile-xp').textContent      = p.usr_xp    || '0';
            document.getElementById('profile-leiloes').textContent = p.active_auctions || '0';
            document.getElementById('profile-licitacoes').textContent = p.total_bids || '0';
        }
    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
    }
}

document.getElementById('form-atualizar')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return;

    const email    = document.getElementById('edit-email')?.value.trim()    || '';
    const password = document.getElementById('edit-password')?.value         || '';
    const bio      = document.getElementById('edit-bio')?.value.trim()       || '';

    const payload = { user_id: user.id };
    if (email)    payload.email    = email;
    if (password) payload.password = password;
    if (bio)      payload.bio      = bio;

    try {
        const res = await fetch(`${BASE_URL}/api/user/update_profile.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        const msgEl = document.getElementById('perfil-msg');
        if (msgEl) {
            msgEl.style.color = data.status === 'success' ? 'green' : 'red';
            msgEl.textContent = data.message || (data.status === 'success' ? 'Perfil atualizado!' : 'Erro ao atualizar.');
        }
    } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
    }
});

document.getElementById('btn-logout')?.addEventListener('click', function () {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/NextBid/frontend/hmtl/auth/Login.html';
});
