// Navbar user-card state + dropdown + wallet modal toggle
window.NB = window.NB || {};

NB.renderNavbar = function () {
    const slot = document.getElementById('navbar-auth');
    if (!slot) return;

    const user = NB.getCurrentUser();
    slot.innerHTML = user ? NB._navbarUser(user) : NB._navbarGuest();

    if (user) NB._wireUserCard();
};

NB._navbarGuest = function () {
    return `
        <a href="${NB._authPath('login')}" class="btn btn--ghost">Login</a>
        <a href="${NB._authPath('register')}" class="btn btn--primary">Registar</a>`;
};

NB._navbarUser = function (user) {
    return `
        <div class="dropdown-wrap">
            <div class="user-card" id="nb-user-card">
                <div class="user-card__avatar">
                    <img src="${NB.escHtml(NB.avatarUrl(user))}" alt="${NB.escHtml(user.name)}" />
                </div>
                <div class="user-card__info">
                    <span class="user-card__name">${NB.escHtml(user.name)}</span>
                    <span class="user-card__balance">€ ${Number(user.wallet || 0).toLocaleString('pt-PT')}</span>
                </div>
            </div>
            <div class="dropdown" id="nb-dropdown">
                <a href="${NB._path('Perfil.html')}" class="dropdown__item">👤 Ver Perfil</a>
                <a href="${NB._path('LL active/MeusLeiloes.html')}" class="dropdown__item">🔨 Os Meus Leilões</a>
                <button class="dropdown__item dropdown__item--danger" onclick="NB.logout()">🚪 Terminar Sessão</button>
            </div>
        </div>`;
};

NB._wireUserCard = function () {
    const card = document.getElementById('nb-user-card');
    const dd   = document.getElementById('nb-dropdown');
    if (!card || !dd) return;
    card.addEventListener('click', e => { e.stopPropagation(); dd.classList.toggle('open'); });
    document.addEventListener('click', e => {
        if (!card.contains(e.target) && !dd.contains(e.target)) dd.classList.remove('open');
    });
};

// Path helpers: build relative paths based on current page depth
NB._path = function (rel) {
    const depth = (location.pathname.match(/\/hmtl\/(.+\/)/) || ['', ''])[1].split('/').length - 1;
    return '../'.repeat(depth) + rel;
};

NB._authPath = function (page) {
    return NB._path(`auth/${page}.html`);
};
