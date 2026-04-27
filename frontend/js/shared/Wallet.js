// Wallet modal (frontend-only, updates localStorage user.wallet; no backend)
window.NB = window.NB || {};

NB.mountWalletModal = function () {
    if (document.getElementById('wallet-modal')) return;
    const tpl = document.createElement('div');
    tpl.innerHTML = `
        <div class="modal-overlay" id="wallet-modal" role="dialog" aria-modal="true">
            <div class="modal modal--compact">
                <div class="modal__header">
                    <h2 class="modal__title">Adicionar Fundos</h2>
                    <button class="modal__close" id="wallet-close" aria-label="Fechar">✕</button>
                </div>
                <div class="modal__body">
                    <p class="wallet-modal__sub">Escolha o montante para adicionar à sua carteira NextBid</p>
                    <div class="wallet-grid" id="wallet-grid">
                        ${[50,100,250,500,1000,2500].map(v =>
                            `<button class="wallet-amount" data-amount="${v}">${v}€</button>`).join('')}
                    </div>
                    <div class="wallet-custom">
                        <input type="number" id="wallet-custom-input" class="form-input"
                               placeholder="Outro valor (€)" min="1" step="1" />
                        <button class="btn btn--primary" id="wallet-custom-add">Adicionar</button>
                    </div>
                    <button class="btn btn--ghost btn--full" id="wallet-cancel">Cancelar</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(tpl.firstElementChild);

    const modal = document.getElementById('wallet-modal');
    const close = () => modal.classList.remove('open');
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.getElementById('wallet-close').addEventListener('click', close);
    document.getElementById('wallet-cancel').addEventListener('click', close);

    const applyAmount = (amount) => {
        const user = NB.getCurrentUser();
        if (!user) return;
        const current = Number(user.wallet ?? user.usr_balance ?? 0);
        user.wallet = current + amount;
        delete user.token; // token lives in its own key
        localStorage.setItem('user', JSON.stringify(user));
        close();
        NB.renderNavbar();

        const pfBal = document.getElementById('pf-balance');
        if (pfBal) {
            pfBal.textContent = user.wallet.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    };

    document.getElementById('wallet-grid').addEventListener('click', e => {
        const btn = e.target.closest('[data-amount]');
        if (!btn) return;
        applyAmount(Number(btn.dataset.amount));
    });

    const customInput = document.getElementById('wallet-custom-input');
    const customAdd   = document.getElementById('wallet-custom-add');
    const submitCustom = () => {
        const amount = Number(customInput.value);
        if (!Number.isFinite(amount) || amount <= 0) {
            customInput.focus();
            return;
        }
        customInput.value = '';
        applyAmount(amount);
    };
    customAdd.addEventListener('click', submitCustom);
    customInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); submitCustom(); }
    });
};

NB.openWalletModal = function () {
    NB.mountWalletModal();
    document.getElementById('wallet-modal')?.classList.add('open');
};
