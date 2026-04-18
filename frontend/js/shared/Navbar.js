// Navbar user-card + dropdown + wallet trigger + quick logout (with confirm)
window.NB = window.NB || {};

NB.renderNavbar = function () {
    const slot = document.getElementById('navbar-auth');
    if (!slot) return;

    const user = NB.getCurrentUser();
    slot.innerHTML = user ? NB._navbarUser(user) : NB._navbarGuest();

    if (user) NB._wireUserCard();
    if (typeof NB.mountWalletModal === 'function') NB.mountWalletModal();
    NB._mountLogoutModal();
};

NB._navbarGuest = function () {
    return `
        <a href="${NB._authPath('login')}" class="btn btn--ghost">Login</a>
        <a href="${NB._authPath('register')}" class="btn btn--primary">Registar</a>`;
};

NB._navbarUser = function (user) {
    const walletVal = Number(user.wallet ?? user.usr_balance ?? 0);
    const level = Math.floor(Math.sqrt((user.xp ?? 0) / 100)) + 1;
    const avatar = NB.avatarUrl(user);
    const avatarStyle = avatar ? '' : ' style="background:linear-gradient(135deg,#2a2d36,#1a1d24);"';
    const avatarImg   = avatar ? `<img src="${NB.escHtml(avatar)}" alt="${NB.escHtml(user.name)}" />` : '';
    return `
        <div class="user-cluster">
            <div class="dropdown-wrap">
                <div class="user-card" id="nb-user-card">
                    <div class="user-card__avatar"${avatarStyle}>
                        ${avatarImg}
                    </div>
                    <div class="user-card__info">
                        <div class="user-card__row">
                            <span class="user-card__name">${NB.escHtml(user.name)}</span>
                            <span class="user-card__level">★ Nível ${level}</span>
                        </div>
                        <span class="user-card__balance">💳 ${walletVal.toLocaleString('pt-PT')}€</span>
                    </div>
                </div>
                <div class="dropdown" id="nb-dropdown">
                    <a href="${NB._path('Perfil.html')}" class="dropdown__item">👤 Ver Perfil</a>
                    <a href="${NB._path('LL active/MeusLeiloes.html')}" class="dropdown__item">⚖️ Os Meus Leilões</a>
                    <button class="dropdown__item" id="nb-add-funds">💳 Adicionar Fundos</button>
                </div>
            </div>
            <button class="icon-btn icon-btn--danger" title="Terminar Sessão" onclick="NB.confirmLogout()" aria-label="Terminar Sessão">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
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
    document.getElementById('nb-add-funds')?.addEventListener('click', () => {
        dd.classList.remove('open');
        if (typeof NB.openWalletModal === 'function') NB.openWalletModal();
    });
};

NB._mountLogoutModal = function () {
    if (document.getElementById('nb-logout-modal')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
        <div class="modal-overlay" id="nb-logout-modal" role="dialog" aria-modal="true">
            <div class="modal modal--sm">
                <div class="modal__header">
                    <h2 class="modal__title">Terminar Sessão?</h2>
                    <button class="modal__close" aria-label="Fechar">✕</button>
                </div>
                <div class="modal__body">
                    <p class="confirm-text">Tens a certeza que queres sair da tua conta?</p>
                    <div class="confirm-actions">
                        <button class="btn btn--ghost" id="nb-logout-cancel">Cancelar</button>
                        <button class="btn btn--danger btn--solid" id="nb-logout-confirm">Terminar Sessão</button>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(wrap.firstElementChild);

    const modal = document.getElementById('nb-logout-modal');
    const close = () => modal.classList.remove('open');
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    modal.querySelector('.modal__close').addEventListener('click', close);
    document.getElementById('nb-logout-cancel').addEventListener('click', close);
    document.getElementById('nb-logout-confirm').addEventListener('click', () => NB.logout());
};

NB.confirmLogout = function () {
    NB._mountLogoutModal();
    document.getElementById('nb-logout-modal').classList.add('open');
};

NB._path = function (rel) {
    const depth = (location.pathname.match(/\/hmtl\/(.+\/)/) || ['', ''])[1].split('/').length - 1;
    return '../'.repeat(depth) + rel;
};

NB._authPath = function (page) {
    return NB._path(`auth/${page}.html`);
};
