const BASE_URL = 'http://localhost/NextBid/backend';

document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        window.location.href = '/NextBid/frontend/hmtl/auth/Login.html';
        return;
    }

    carregarPerfil(user.id);
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
        if (u && u.avatar) {
            const img = document.createElement('img');
            img.src = u.avatar;
            img.alt = u.name || '';
            img.style.width  = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            preview.appendChild(img);
        }
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
