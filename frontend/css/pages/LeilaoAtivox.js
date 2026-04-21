// Página de detalhe de um leilão específico.
// Lê ?id= da URL, carrega tudo do backend, liga licitação/chat/eliminar.
(function () {
    const CHAT_REFRESH_MS = 5000;
    const BIDS_REFRESH_MS = 10000;

    let productId = 0;
    let auction   = null;
    let currentUser = null;
    let chatTimer = null;
    let bidsTimer = null;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        NB.renderNavbar();
        currentUser = NB.getCurrentUser();

        productId = parseInt(new URLSearchParams(location.search).get('id') || '0', 10);
        if (!productId) {
            showError('ID de leilão em falta na URL.');
            return;
        }

        loadAuction();
        loadBids();
        loadChat();

        bidsTimer = setInterval(loadBids, BIDS_REFRESH_MS);
        chatTimer = setInterval(loadChat, CHAT_REFRESH_MS);

        wireBidForm();
        wireChatForm();
        wireDelete();
        wireAddFunds();
    }

    // ---------- Carregar leilão ----------

    async function loadAuction() {
        try {
            const data = await NB.apiGet(`/api/auctions/get_by_id.php?product_id=${productId}`);
            if (data.status !== 'success' || !data.data) {
                showError(data.message || 'Leilão não encontrado.');
                return;
            }
            auction = data.data;
            renderAuction();
        } catch (e) {
            showError('Erro de rede ao carregar o leilão.');
        }
    }

    function renderAuction() {
        document.getElementById('la-loading').hidden = true;
        document.getElementById('la-content').hidden = false;

        document.title = `NextBid — ${auction.prd_name}`;

        setText('la-title', auction.prd_name);
        setText('la-category', auction.cat_name);
        setText('la-condition', auction.prd_condition);
        setText('la-status', auction.prd_status);
        setText('la-location', auction.prd_location || '—');
        setText('la-description', auction.prd_description);
        setText('la-start-price', NB.formatCurrency(auction.prd_start_price));
        setText('la-ends-at', formatDate(auction.prd_ends_at));

        const currentBid = auction.current_bid || auction.prd_start_price;
        setText('la-current-bid', NB.formatCurrency(currentBid));
        setText('la-bid-count', auction.bid_count || 0);

        renderImages(auction.images || []);
        renderAttributes(auction.attributes || []);
        renderSeller();
        startCountdown();
        configureBidSection(currentBid);
        configureOwnerSection();
    }

    function renderImages(images) {
        const main = document.getElementById('la-main-image');
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

        images.forEach(img => {
            const t = document.createElement('img');
            t.src = buildImgUrl(img.img_path);
            t.alt = auction.prd_name;
            t.width = 80;
            t.height = 80;
            t.style.cursor = 'pointer';
            t.style.marginRight = '6px';
            t.addEventListener('click', () => { main.src = t.src; });
            thumbs.appendChild(t);
        });
    }

    function renderAttributes(attrs) {
        const section = document.getElementById('la-attributes-section');
        const tbody   = document.getElementById('la-attributes');
        tbody.innerHTML = '';

        if (!attrs.length) {
            section.hidden = true;
            return;
        }
        section.hidden = false;
        attrs.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${NB.escHtml(a.atr_name)}</td><td>${NB.escHtml(a.atr_value)}</td>`;
            tbody.appendChild(tr);
        });
    }

    function renderSeller() {
        const photo = document.getElementById('la-seller-photo');
        photo.src = auction.seller_photo || NB.defaultAvatarUrl();
        setText('la-seller-name', auction.seller_name || '—');

        const rating = auction.seller_rating ? Number(auction.seller_rating).toFixed(1) : '—';
        setText('la-seller-rating', rating);
        setText('la-seller-reviews', auction.seller_reviews || 0);
    }

    function startCountdown() {
        const el = document.getElementById('la-countdown');
        if (auction.prd_status !== 'active') {
            el.textContent = 'Leilão não ativo';
            return;
        }
        NB.iniciarCronometro(auction.prd_ends_at, el);
    }

    // ---------- Licitação ----------

    function configureBidSection(currentBid) {
        const form       = document.getElementById('la-bid-form');
        const authMsg    = document.getElementById('la-bid-required-auth');
        const ownerMsg   = document.getElementById('la-bid-owner-msg');
        const endedMsg   = document.getElementById('la-bid-ended-msg');

        form.hidden = authMsg.hidden = ownerMsg.hidden = endedMsg.hidden = true;

        if (auction.prd_status !== 'active') {
            endedMsg.hidden = false;
            return;
        }
        if (!currentUser) {
            authMsg.hidden = false;
            return;
        }
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

        updateBalanceDisplay();
    }

    function updateBalanceDisplay() {
        const u = NB.getCurrentUser();
        const bal = Number(u?.wallet ?? u?.usr_balance ?? 0);
        setText('la-user-balance', NB.formatCurrency(bal));
    }

    function wireBidForm() {
        document.getElementById('la-bid-form').addEventListener('submit', handleBidSubmit);
        document.querySelectorAll('.la-bid-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById('la-bid-amount');
                const base = Number(input.dataset.base || 0);
                const delta = Number(btn.dataset.delta || 0);
                input.value = base + delta;
            });
        });
    }

    async function handleBidSubmit(e) {
        e.preventDefault();
        const msg    = document.getElementById('la-bid-msg');
        const amount = Number(document.getElementById('la-bid-amount').value);

        msg.style.color = '';
        msg.textContent = 'A enviar licitação…';

        if (!amount || amount <= 0) {
            msg.style.color = 'red';
            msg.textContent = 'Valor inválido.';
            return;
        }

        try {
            const res = await NB.apiPost(
                '/api/bids/place.php',
                { product_id: productId, amount },
                { auth: true }
            );
            if (res.status === 'success') {
                msg.style.color = 'green';
                msg.textContent = res.message || 'Licitação aceite.';
                await loadAuction();
                await loadBids();
            } else {
                msg.style.color = 'red';
                msg.textContent = res.message || 'Licitação rejeitada.';
            }
        } catch {
            msg.style.color = 'red';
            msg.textContent = 'Erro de rede.';
        }
    }

    function wireAddFunds() {
        document.getElementById('la-add-funds').addEventListener('click', () => {
            if (typeof NB.openWalletModal === 'function') {
                NB.openWalletModal();
                setTimeout(updateBalanceDisplay, 500);
            }
        });
    }

    // ---------- Histórico de licitações ----------

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
            list.appendChild(empty);
            empty.hidden = false;
            return;
        }

        bids.forEach(b => {
            const li = document.createElement('li');
            li.innerHTML =
                `<strong>${NB.escHtml(b.bidder_name)}</strong> — ` +
                `${NB.formatCurrency(b.bid_amount)} ` +
                `<small>(${formatDate(b.bid_created_at)})</small>`;
            list.appendChild(li);
        });
    }

    // ---------- Chat ----------

    async function loadChat() {
        try {
            const data = await NB.apiGet(`/api/chat/get.php?product_id=${productId}&limit=100`);
            if (data.status !== 'success') return;
            renderChat(data.messages || []);
        } catch {}
    }

    function renderChat(msgs) {
        const box   = document.getElementById('la-chat-messages');
        const empty = document.getElementById('la-chat-empty');
        box.innerHTML = '';

        if (!msgs.length) {
            box.appendChild(empty);
            empty.hidden = false;
        } else {
            msgs.forEach(m => {
                const p = document.createElement('p');
                p.innerHTML =
                    `<strong>${NB.escHtml(m.user_name)}</strong>: ` +
                    `${NB.escHtml(m.cht_content)} ` +
                    `<small>(${formatDate(m.cht_created_at)})</small>`;
                box.appendChild(p);
            });
            box.scrollTop = box.scrollHeight;
        }

        document.getElementById('la-chat-form').hidden      = !currentUser;
        document.getElementById('la-chat-auth-msg').hidden  = !!currentUser;
    }

    function wireChatForm() {
        document.getElementById('la-chat-form').addEventListener('submit', handleChatSubmit);
    }

    async function handleChatSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('la-chat-input');
        const msg   = document.getElementById('la-chat-msg');
        const content = input.value.trim();

        if (!content) return;

        msg.style.color = '';
        msg.textContent = 'A enviar…';

        try {
            const res = await NB.apiPost(
                '/api/chat/send.php',
                { product_id: productId, content },
                { auth: true }
            );
            if (res.status === 'success') {
                input.value = '';
                msg.textContent = '';
                loadChat();
            } else {
                msg.style.color = 'red';
                msg.textContent = res.message || 'Erro ao enviar.';
            }
        } catch {
            msg.style.color = 'red';
            msg.textContent = 'Erro de rede.';
        }
    }

    // ---------- Dono: eliminar leilão ----------

    function configureOwnerSection() {
        const section = document.getElementById('la-owner-actions');
        const isOwner = currentUser && Number(auction.seller_id) === Number(currentUser.id);
        section.hidden = !isOwner;
    }

    function wireDelete() {
        document.getElementById('la-delete-btn').addEventListener('click', handleDelete);
    }

    async function handleDelete() {
        const msg = document.getElementById('la-delete-msg');
        if (!confirm('Tens a certeza que queres eliminar este leilão? Esta ação não pode ser revertida.')) return;

        msg.style.color = '';
        msg.textContent = 'A eliminar…';

        try {
            const res = await NB.apiPost(
                '/api/auctions/cancel.php',
                { product_id: productId },
                { auth: true }
            );
            if (res.status === 'success') {
                msg.style.color = 'green';
                msg.textContent = 'Leilão eliminado. A redirecionar…';
                clearInterval(chatTimer);
                clearInterval(bidsTimer);
                setTimeout(() => { location.href = 'LeiloesAtivos.html'; }, 1200);
            } else {
                msg.style.color = 'red';
                msg.textContent = res.message || 'Não foi possível eliminar.';
            }
        } catch {
            msg.style.color = 'red';
            msg.textContent = 'Erro de rede.';
        }
    }

    // ---------- Utilidades ----------

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val ?? '';
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
        return `${NB.BASE_URL}/${clean}`;
    }

    function formatDate(dt) {
        if (!dt) return '—';
        const d = new Date(String(dt).replace(' ', 'T'));
        if (isNaN(d)) return dt;
        return d.toLocaleString('pt-PT');
    }
})();
