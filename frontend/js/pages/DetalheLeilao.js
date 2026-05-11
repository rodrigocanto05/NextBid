// Auction detail page — real-time chat via Server-Sent Events (EventSource)
(function () {
    const BIDS_REFRESH_MS = 8000;

    let productId   = 0;
    let auction     = null;
    let currentUser = null;
    let bidsTimer   = null;
    let chatEs      = null;   // EventSource instance
    let lastChatId  = 0;      // tracks newest message id for SSE reconnects
    let chatMsgCount = 0;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        NB.renderNavbar();
        currentUser = NB.getCurrentUser();

        productId = parseInt(new URLSearchParams(location.search).get('id') || '0', 10);
        if (!productId) { showError('ID de leilão em falta na URL.'); return; }

        loadAuction();
        loadBids();
        startChatSSE();

        bidsTimer = setInterval(loadBids, BIDS_REFRESH_MS);

        wireBidForm();
        wireChatForm();
        wireChatDevForm();
        wireDelete();
        wireAddFunds();
        wireChatTextarea();
        renderChatUI();
    }

    // ─────────────────────────────────────────────────────────────
    //  Auction
    // ─────────────────────────────────────────────────────────────

    async function loadAuction() {
        try {
            const data = await NB.apiGet(`/api/auctions/get_by_id.php?product_id=${productId}`);
            if (data.status !== 'success' || !data.data) {
                showError(data.message || 'Leilão não encontrado.');
                return;
            }
            auction = data.data;
            renderAuction();
        } catch {
            showError('Erro de rede ao carregar o leilão.');
        }
    }

    function renderAuction() {
        document.getElementById('la-loading').hidden = true;
        document.getElementById('la-content').hidden = false;

        document.title = `NextBid — ${auction.prd_name}`;

        setText('la-title',       auction.prd_name);
        setText('la-category',    auction.cat_name);
        setText('la-condition',   auction.prd_condition);
        setText('la-location',    auction.prd_location || '—');
        setText('la-description', auction.prd_description);
        setText('la-start-price', NB.formatCurrency(auction.prd_start_price));
        setText('la-ends-at',     'Termina: ' + formatDate(auction.prd_ends_at));

        const currentBid = auction.current_bid || auction.prd_start_price;
        setText('la-current-bid', NB.formatCurrency(currentBid));
        setText('la-bid-count',   auction.bid_count || 0);

        renderStatusBadge(auction.prd_status);
        renderImages(auction.images || []);
        renderAttributes(auction.attributes || []);
        renderSeller();
        startCountdown();
        configureBidSection(currentBid);
        configureOwnerSection();
        updateBalanceDisplay();
    }

    function renderStatusBadge(status) {
        const el = document.getElementById('la-status-badge');
        if (!el) return;
        const map = {
            active:    ['la-badge--active',  'Ativo'],
            ended:     ['la-badge--ended',   'Terminado'],
            cancelled: ['la-badge--ended',   'Cancelado'],
            pending:   ['la-badge--pending', 'Pendente'],
        };
        const [cls, label] = map[status] || ['la-badge--pending', status];
        el.className = `la-badge ${cls}`;
        el.textContent = label;
    }

    function renderImages(images) {
        const main   = document.getElementById('la-main-image');
        const thumbs = document.getElementById('la-thumbs');
        thumbs.innerHTML = '';

        if (!images.length) {
            main.src = '';
            main.alt = 'Sem imagem';
            return;
        }

        const primary = images.find(i => i.img_is_primary) || images[0];
        main.src = buildImgUrl(primary.img_path);
        main.alt = auction.prd_name;

        images.forEach((img, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'la-gallery__thumb' + (idx === 0 ? ' la-gallery__thumb--active' : '');
            const t = document.createElement('img');
            t.src = buildImgUrl(img.img_path);
            t.alt = `Imagem ${idx + 1}`;
            t.loading = 'lazy';
            wrap.appendChild(t);
            wrap.addEventListener('click', () => {
                main.src = t.src;
                thumbs.querySelectorAll('.la-gallery__thumb').forEach(w => w.classList.remove('la-gallery__thumb--active'));
                wrap.classList.add('la-gallery__thumb--active');
            });
            thumbs.appendChild(wrap);
        });
    }

    function renderAttributes(attrs) {
        const section = document.getElementById('la-attributes-section');
        const tbody   = document.getElementById('la-attributes');
        tbody.innerHTML = '';
        if (!attrs.length) { section.hidden = true; return; }
        section.hidden = false;
        attrs.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${NB.escHtml(a.atr_name)}</td><td>${NB.escHtml(a.atr_value)}</td>`;
            tbody.appendChild(tr);
        });
    }

    function renderSeller() {
        const photo = document.getElementById('la-seller-photo');
        photo.src = buildImgUrl(auction.seller_photo) || NB.defaultAvatarUrl();
        setText('la-seller-name', auction.seller_name || '—');
        const rating = auction.seller_rating ? Number(auction.seller_rating).toFixed(1) : '—';
        setText('la-seller-rating',  rating);
        setText('la-seller-reviews', auction.seller_reviews || 0);
    }

    function startCountdown() {
        const el = document.getElementById('la-countdown');
        if (auction.prd_status !== 'active') {
            el.textContent = auction.prd_status === 'ended' ? 'Terminado' : 'Não ativo';
            return;
        }
        NB.iniciarCronometro(auction.prd_ends_at, el);
    }

    // ─────────────────────────────────────────────────────────────
    //  Bid form
    // ─────────────────────────────────────────────────────────────

    function configureBidSection(currentBid) {
        const form     = document.getElementById('la-bid-form');
        const authMsg  = document.getElementById('la-bid-required-auth');
        const ownerMsg = document.getElementById('la-bid-owner-msg');
        const endedMsg = document.getElementById('la-bid-ended-msg');

        form.hidden = authMsg.hidden = ownerMsg.hidden = endedMsg.hidden = true;

        if (auction.prd_status !== 'active') { endedMsg.hidden = false; return; }
        if (!currentUser)                     { authMsg.hidden  = false; return; }
        if (Number(auction.seller_id) === Number(currentUser.id)) {
            ownerMsg.hidden = false;
            return;
        }

        form.hidden = false;
        const minBid = Number(currentBid) + 1;
        setText('la-min-bid', NB.formatCurrency(minBid));
        const input = document.getElementById('la-bid-amount');
        input.min   = minBid;
        input.value = minBid;
        input.dataset.base = String(currentBid);
    }

    function updateBalanceDisplay() {
        const u   = NB.getCurrentUser();
        const bal = Number(u?.wallet ?? u?.usr_balance ?? 0);
        const fmt = NB.formatCurrency(bal);
        setText('la-user-balance',      fmt);
        setText('la-user-balance-stat', fmt);
    }

    function wireBidForm() {
        document.getElementById('la-bid-form').addEventListener('submit', handleBidSubmit);
        document.querySelectorAll('.la-bid-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById('la-bid-amount');
                const base  = Number(input.dataset.base || 0);
                input.value = base + Number(btn.dataset.delta || 0);
            });
        });
    }

    async function handleBidSubmit(e) {
        e.preventDefault();
        const msgEl  = document.getElementById('la-bid-msg');
        const amount = Number(document.getElementById('la-bid-amount').value);

        msgEl.innerHTML = '';
        setFeedback(msgEl, 'A enviar licitação…', 'var(--text-muted)');

        if (!amount || amount <= 0) { setFeedback(msgEl, 'Valor inválido.', 'var(--danger)'); return; }

        // Client-side balance pre-check for fast UX (server still validates)
        const cachedBalance = Number(NB.getCurrentUser()?.wallet ?? 0);
        if (cachedBalance < amount) {
            renderInsufficientFunds(msgEl, cachedBalance, amount);
            return;
        }

        try {
            const res = await NB.apiPost('/api/bids/place.php', { product_id: productId, amount }, { auth: true });
            if (res.status === 'success') {
                setFeedback(msgEl, res.message || 'Licitação aceite!', 'var(--success)');

                // Server returns the post-bid balance — patch local cache + visible counters in place.
                if (typeof res.new_balance === 'number') {
                    syncBalance(res.new_balance);
                }

                await loadAuction();
                await loadBids();
            } else if (res.code === 'insufficient_funds') {
                renderInsufficientFunds(msgEl, Number(res.balance ?? 0), Number(res.required ?? amount));
            } else {
                setFeedback(msgEl, res.message || 'Licitação rejeitada.', 'var(--danger)');
            }
        } catch {
            setFeedback(msgEl, 'Erro de rede.', 'var(--danger)');
        }
    }

    function syncBalance(newBal) {
        const u = NB.getCurrentUser();
        if (u) {
            u.wallet = newBal;
            delete u.token;
            localStorage.setItem('user', JSON.stringify(u));
        }
        // Patch DOM counters in place — never re-render the navbar (would wipe listeners)
        const fmt = NB.formatCurrency(newBal);
        setText('la-user-balance',      fmt);
        setText('la-user-balance-stat', fmt);
        const navBal = document.querySelector('.user-card__balance');
        if (navBal) navBal.textContent = `💳 ${newBal.toLocaleString('pt-PT')}€`;
    }

    function renderInsufficientFunds(msgEl, balance, required) {
        const missing = Math.max(0, required - balance);
        msgEl.innerHTML = `
            <span style="color:var(--danger);display:block;margin-bottom:6px;">
                Saldo insuficiente — tens <strong>${NB.formatCurrency(balance)}</strong>
                e precisas de <strong>${NB.formatCurrency(required)}</strong>
                (faltam ${NB.formatCurrency(missing)}).
            </span>
            <a href="#" class="btn btn--primary btn--sm" id="la-bid-add-funds">+ Adicionar Fundos</a>`;
        document.getElementById('la-bid-add-funds')?.addEventListener('click', e => {
            e.preventDefault();
            if (typeof NB.openWalletModal === 'function') {
                NB.openWalletModal();
            }
        });
    }

    function wireAddFunds() {
        document.getElementById('la-add-funds').addEventListener('click', () => {
            if (typeof NB.openWalletModal === 'function') {
                NB.openWalletModal();
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  Bids history (polled)
    // ─────────────────────────────────────────────────────────────

    async function loadBids() {
        try {
            const data = await NB.apiGet(`/api/bids/get_by_auction.php?product_id=${productId}&limit=50`);
            if (data.status !== 'success') return;
            renderBids(data.bids || []);
        } catch {}
    }

    function renderBids(bids) {
        const list  = document.getElementById('la-bids-list');
        const empty = document.getElementById('la-bids-empty');
        setText('la-bids-count', bids.length);

        list.innerHTML = '';

        if (!bids.length) {
            empty.className = 'la-bids-empty';
            list.appendChild(empty);
            return;
        }

        bids.forEach((b, idx) => {
            const li = document.createElement('li');
            li.className = 'la-bid-item';

            const rankEl = document.createElement('span');
            rankEl.className = 'la-bid-item__rank' + (idx === 0 ? ' la-bid-item__rank--gold' : '');
            rankEl.textContent = idx === 0 ? '🥇' : `#${idx + 1}`;

            const infoEl = document.createElement('div');
            infoEl.className = 'la-bid-item__info';
            infoEl.innerHTML =
                `<p class="la-bid-item__name">${NB.escHtml(b.bidder_name)}</p>` +
                `<p class="la-bid-item__date">${formatDate(b.bid_created_at)}</p>`;

            const amtEl = document.createElement('span');
            amtEl.className = 'la-bid-item__amount';
            amtEl.textContent = NB.formatCurrency(b.bid_amount);

            li.appendChild(rankEl);
            li.appendChild(infoEl);
            li.appendChild(amtEl);
            list.appendChild(li);
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  Chat — Server-Sent Events (real-time)
    // ─────────────────────────────────────────────────────────────

    function startChatSSE() {
        closeChatSSE();

        const url = `${NB.BASE_URL}/api/chat/stream.php?product_id=${productId}&last_id=${lastChatId}`;
        chatEs = new EventSource(url);

        chatEs.addEventListener('init', e => {
            const payload = JSON.parse(e.data);
            if (payload.messages && payload.messages.length) {
                renderChatMessages(payload.messages, false);
                lastChatId = payload.last_id || lastChatId;
            }
            renderChatUI();
        });

        chatEs.addEventListener('new', e => {
            const payload = JSON.parse(e.data);
            if (payload.messages && payload.messages.length) {
                renderChatMessages(payload.messages, true);
                lastChatId = payload.last_id || lastChatId;
            }
        });

        chatEs.addEventListener('error', () => {
            // EventSource reconnects automatically; update URL with latest lastChatId
            closeChatSSE();
            setTimeout(startChatSSE, 2000);
        });
    }

    function closeChatSSE() {
        if (chatEs) { chatEs.close(); chatEs = null; }
    }

    function renderChatMessages(msgs, append) {
        const box   = document.getElementById('la-chat-messages');
        const empty = document.getElementById('la-chat-empty');

        if (!append) {
            box.innerHTML = '';
            chatMsgCount = 0;
        }

        // Remove empty placeholder if present
        if (empty && box.contains(empty)) box.removeChild(empty);

        const wasAtBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;

        msgs.forEach(m => {
            const isOwn = currentUser && Number(m.user_id) === Number(currentUser.id);
            const div = document.createElement('div');
            div.className = 'la-msg' + (isOwn ? ' la-msg--own' : '');

            const avatarSrc = buildImgUrl(m.user_photo) || NB.defaultAvatarUrl();
            div.innerHTML = `
                <div class="la-msg__avatar">
                    <img src="${NB.escHtml(avatarSrc)}" alt="${NB.escHtml(m.user_name)}" loading="lazy" />
                </div>
                <div class="la-msg__content">
                    <p class="la-msg__name">${NB.escHtml(m.user_name)}</p>
                    <div class="la-msg__bubble">
                        <p class="la-msg__text">${NB.escHtml(m.cht_content)}</p>
                    </div>
                    <span class="la-msg__time">${formatTime(m.cht_created_at)}</span>
                </div>`;
            box.appendChild(div);
            chatMsgCount++;
        });

        setText('la-chat-count', `${chatMsgCount} msg${chatMsgCount !== 1 ? 's' : ''}`);

        if (!append || wasAtBottom) {
            box.scrollTop = box.scrollHeight;
        }

        renderChatUI();
    }

    function renderChatUI() {
        const form      = document.getElementById('la-chat-form');
        const authMsg   = document.getElementById('la-chat-auth-msg');
        const devPanel  = document.getElementById('la-chat-dev');

        form.hidden     = !currentUser;
        authMsg.hidden  = !!currentUser;
        if (devPanel) devPanel.hidden = !!currentUser;
    }

    function wireChatForm() {
        document.getElementById('la-chat-form').addEventListener('submit', handleChatSubmit);
    }

    function wireChatDevForm() {
        const devForm = document.getElementById('la-chat-dev-form');
        if (!devForm) return;
        devForm.addEventListener('submit', handleChatDevSubmit);
    }

    async function handleChatDevSubmit(e) {
        e.preventDefault();
        const input   = document.getElementById('la-chat-dev-input');
        const msgEl   = document.getElementById('la-chat-dev-msg');
        const content = input.value.trim();

        if (!content) return;

        msgEl.style.color = '';
        msgEl.textContent = 'A enviar mensagem de teste…';

        try {
            const res = await NB.apiPost(
                '/api/chat/send.php?debug=1',
                { product_id: productId, content },
                { auth: false }
            );

            if (res.status === 'success') {
                input.value = '';
                input.style.height = 'auto';
                msgEl.style.color = 'var(--success)';
                msgEl.textContent = 'Mensagem de teste enviada. Aguarda 2s para o SSE atualizar.';
            } else {
                msgEl.style.color = 'var(--danger)';
                msgEl.textContent = res.message || 'Erro ao enviar mensagem de teste.';
            }
        } catch (err) {
            msgEl.style.color = 'var(--danger)';
            msgEl.textContent = 'Erro de rede ao enviar mensagem de teste.';
        }
    }

    function wireChatTextarea() {
        const ta = document.getElementById('la-chat-input');
        if (!ta) return;
        ta.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('la-chat-form').dispatchEvent(new Event('submit', { cancelable: true }));
            }
        });
        ta.addEventListener('input', () => {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
        });
    }

    async function handleChatSubmit(e) {
        e.preventDefault();
        const input   = document.getElementById('la-chat-input');
        const msgEl   = document.getElementById('la-chat-send-msg');
        const content = input.value.trim();

        if (!content) return;

        msgEl.textContent = '';

        try {
            const res = await NB.apiPost(
                '/api/chat/send.php',
                { product_id: productId, content },
                { auth: true }
            );
            if (res.status === 'success') {
                input.value = '';
                input.style.height = 'auto';
                // SSE will pick up the new message automatically within ~2s
            } else {
                msgEl.style.color = 'var(--danger)';
                msgEl.textContent = res.message || 'Erro ao enviar.';
            }
        } catch {
            msgEl.style.color = 'var(--danger)';
            msgEl.textContent = 'Erro de rede.';
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Owner: delete
    // ─────────────────────────────────────────────────────────────

    function configureOwnerSection() {
        const section = document.getElementById('la-owner-actions');
        const isOwner = currentUser && Number(auction.seller_id) === Number(currentUser.id);
        section.hidden = !isOwner;
    }

    function wireDelete() {
        document.getElementById('la-delete-btn').addEventListener('click', handleDelete);
    }

    async function handleDelete() {
        const msgEl = document.getElementById('la-delete-msg');
        if (!confirm('Tens a certeza que queres eliminar este leilão? Esta ação não pode ser revertida.')) return;

        setFeedback(msgEl, 'A eliminar…', 'var(--text-muted)');

        try {
            const res = await NB.apiPost('/api/auctions/cancel.php', { product_id: productId }, { auth: true });
            if (res.status === 'success') {
                setFeedback(msgEl, 'Leilão eliminado. A redirecionar…', 'var(--success)');
                clearInterval(bidsTimer);
                closeChatSSE();
                setTimeout(() => { location.href = 'LeiloesAtivos.html'; }, 1200);
            } else {
                setFeedback(msgEl, res.message || 'Não foi possível eliminar.', 'var(--danger)');
            }
        } catch {
            setFeedback(msgEl, 'Erro de rede.', 'var(--danger)');
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Utilities
    // ─────────────────────────────────────────────────────────────

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val ?? '';
    }

    function setFeedback(el, text, color) {
        if (!el) return;
        el.textContent = text;
        el.style.color = color || '';
    }

    function showError(text) {
        document.getElementById('la-loading').hidden = true;
        const err = document.getElementById('la-error');
        err.textContent = text;
        err.hidden = false;
    }

    function buildImgUrl(path) {
        if (!path) return '';
        const clean = String(path).replace(/^\/+/, '');
        if (clean.startsWith('http')) return clean;
        return `${NB.BASE_URL}/${clean}`;
    }

    function formatDate(dt) {
        if (!dt) return '—';
        const d = new Date(String(dt).replace(' ', 'T'));
        return isNaN(d) ? dt : d.toLocaleString('pt-PT');
    }

    function formatTime(dt) {
        if (!dt) return '';
        const d = new Date(String(dt).replace(' ', 'T'));
        if (isNaN(d)) return '';
        const now = new Date();
        const diffMs = now - d;
        if (diffMs < 60000) return 'agora mesmo';
        if (diffMs < 3600000) return `há ${Math.floor(diffMs / 60000)} min`;
        return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    }
})();
