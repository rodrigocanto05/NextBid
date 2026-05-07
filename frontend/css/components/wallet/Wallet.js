// Wallet modal — persists deposits via /api/transactions/deposit.php
// and refreshes the localStorage cache so the navbar/profile stay in sync.
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
                    <p class="wallet-msg" id="wallet-msg" aria-live="polite"></p>
                    <button class="btn btn--ghost btn--full" id="wallet-cancel">Cancelar</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(tpl.firstElementChild);

    const modal = document.getElementById('wallet-modal');
    const close = () => { modal.classList.remove('open'); resetMsg(); };
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.getElementById('wallet-close').addEventListener('click', close);
    document.getElementById('wallet-cancel').addEventListener('click', close);

    const msgEl = document.getElementById('wallet-msg');
    const setMsg = (text, color) => { msgEl.textContent = text || ''; msgEl.style.color = color || ''; };
    const resetMsg = () => setMsg('', '');

    const refreshCachedBalance = (newBalance) => {
        const user = NB.getCurrentUser();
        if (!user) return;
        user.wallet = Number(newBalance);
        delete user.token; // token lives in its own key
        localStorage.setItem('user', JSON.stringify(user));

        if (typeof NB.renderNavbar === 'function') NB.renderNavbar();

        const pfBal = document.getElementById('pf-balance');
        if (pfBal) {
            pfBal.textContent = user.wallet.toLocaleString('pt-PT', {
                minimumFractionDigits: 2, maximumFractionDigits: 2
            });
        }

        // Refresh detail-page balance row, if present
        const laBal = document.getElementById('la-user-balance');
        if (laBal) laBal.textContent = NB.formatCurrency(user.wallet);
        const laBalStat = document.getElementById('la-user-balance-stat');
        if (laBalStat) laBalStat.textContent = NB.formatCurrency(user.wallet);
    };

    const applyAmount = async (amount) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        if (!NB.getCurrentUser()?.token) {
            setMsg('Sessão expirada. Faz login novamente.', 'var(--danger)');
            return;
        }
        setMsg('A processar…', 'var(--text-muted)');

        try {
            const res = await NB.apiPost(
                '/api/transactions/deposit.php',
                { amount, description: 'Depósito via carteira' },
                { auth: true }
            );

            if (res.status !== 'success') {
                setMsg(res.message || 'Erro ao depositar.', 'var(--danger)');
                return;
            }

            // Refresh persisted balance from server (single source of truth)
            const bal = await NB.apiGet('/api/transactions/balance.php');
            const newBalance = Number(bal.balance ?? 0);
            refreshCachedBalance(newBalance);

            setMsg(`+${amount}€ adicionados! Saldo: ${NB.formatCurrency(newBalance)}`, 'var(--success)');
            setTimeout(close, 900);
        } catch (e) {
            setMsg('Erro de rede.', 'var(--danger)');
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

// Refresh cached wallet from server and patch the visible balance elements
// in place. We deliberately do NOT call renderNavbar here — that would wipe
// the dropdown / logout button event listeners and create a render loop with
// the renderNavbar → refreshWallet wiring.
NB.refreshWallet = async function () {
    const user = NB.getCurrentUser();
    if (!user?.token) return;
    try {
        const data = await NB.apiGet('/api/transactions/balance.php');
        if (data.status !== 'success') return;

        const newBal = Number(data.balance ?? 0);
        if (newBal === Number(user.wallet ?? 0)) return; // no change

        user.wallet = newBal;
        delete user.token;
        localStorage.setItem('user', JSON.stringify(user));

        // Patch existing DOM nodes in place so listeners stay attached.
        const balEl = document.querySelector('.user-card__balance');
        if (balEl) balEl.textContent = `💳 ${newBal.toLocaleString('pt-PT')}€`;

        const pfBal = document.getElementById('pf-balance');
        if (pfBal) {
            pfBal.textContent = newBal.toLocaleString('pt-PT', {
                minimumFractionDigits: 2, maximumFractionDigits: 2
            });
        }

        const laBal = document.getElementById('la-user-balance');
        if (laBal) laBal.textContent = NB.formatCurrency(newBal);
        const laBalStat = document.getElementById('la-user-balance-stat');
        if (laBalStat) laBalStat.textContent = NB.formatCurrency(newBal);
    } catch (e) { /* offline — keep cached */ }
};
