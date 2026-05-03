(function () {
    "use strict";

    const firebaseConfig = {
        apiKey: "AIzaSy...",
        authDomain: "nextbid-chat.firebaseapp.com",
        databaseURL: "https://nextbid-chat-default-rtdb.firebaseio.com",
        projectId: "nextbid-chat",
        storageBucket: "nextbid-chat.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef",
    };

    let db = null;
    let chatRef = null;
    let currentUser = null;

    function getCurrentUser() {
        const savedUser = localStorage.getItem("nextbid_user");
        if (savedUser) {
            try {
                const p = JSON.parse(savedUser);
                return p.username || p.name || "Utilizador";
            } catch (_) {}
        }
        let tempName = localStorage.getItem("nextbid_temp_name");
        if (!tempName) {
            const n = ["Comprador", "Licitante", "Visitante"];
            tempName = n[Math.floor(Math.random() * n.length)] + Math.floor(Math.random() * 999 + 1);
            localStorage.setItem("nextbid_temp_name", tempName);
        }
        return tempName;
    }

    window.initChat = function (auctionId) {
        currentUser = getCurrentUser();

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
        chatRef = db.ref("chats/" + auctionId);

        renderChatUI();
        listenForMessages();

        window.addEventListener("online", () => setStatus("online"));
        window.addEventListener("offline", () => setStatus("offline"));
        setTimeout(() => setStatus("online"), 800);
    };

    function renderChatUI() {
        var container = document.getElementById("auction-chat");
        if (!container) return;

        container.innerHTML =
            '<div class="nb-chat">' +
            '<div class="nb-chat__header">' +
            '<div class="nb-chat__title"><span class="nb-chat__icon">💬</span>Chat do Leilão</div>' +
            '<div class="nb-chat__status">' +
            '<span class="nb-chat__dot" id="chat-status-dot"></span>' +
            '<span class="nb-chat__status-text" id="chat-status-text">A conectar...</span>' +
            '</div>' +
            '</div>' +
            '<div class="nb-chat__user-bar">A participar como: <strong id="chat-username">' + escapeHtml(currentUser) + '</strong>' +
            '<button class="nb-chat__change-name" id="btn-change-name" title="Alterar nome">✏️</button>' +
            '</div>' +
            '<div class="nb-chat__messages" id="chat-messages" role="log" aria-live="polite">' +
            '<div class="nb-chat__empty" id="chat-empty">Sê o primeiro a escrever algo sobre este leilão!</div>' +
            '</div>' +
            '<div class="nb-chat__input-area">' +
            '<input type="text" id="chat-input" class="nb-chat__input" placeholder="Escreve uma mensagem..." maxlength="300" autocomplete="off" />' +
            '<button id="chat-send" class="nb-chat__send" aria-label="Enviar">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>' +
            '</button>' +
            '</div>' +
            '</div>';

        document.getElementById("chat-send").addEventListener("click", sendMessage);
        document.getElementById("chat-input").addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
        });
        document.getElementById("btn-change-name").addEventListener("click", changeName);
    }

    function listenForMessages() {
        var recentQuery = chatRef.orderByChild("timestamp").limitToLast(50);
        recentQuery.on("child_added", function (snapshot) {
            var msg = snapshot.val();
            if (msg) appendMessage(msg);
        });
    }

    function sendMessage() {
        var input = document.getElementById("chat-input");
        var text = input.value.trim();
        if (!text) return;

        var sendBtn = document.getElementById("chat-send");
        sendBtn.disabled = true;
        input.value = "";

        chatRef.push({ user: currentUser, text: text, timestamp: Date.now() })
            .catch(function (err) {
                console.error("[NextBid Chat] Erro:", err);
                input.value = text;
            })
            .finally(function () {
                sendBtn.disabled = false;
                input.focus();
            });
    }

    function appendMessage(msg) {
        var messagesEl = document.getElementById("chat-messages");
        var emptyEl = document.getElementById("chat-empty");
        if (!messagesEl) return;
        if (emptyEl) emptyEl.remove();

        var isOwn = msg.user === currentUser;
        var time = formatTime(msg.timestamp);

        var msgEl = document.createElement("div");
        msgEl.className = "nb-chat__msg" + (isOwn ? " nb-chat__msg--own" : "");
        msgEl.innerHTML =
            (!isOwn ? '<span class="nb-chat__msg-user">' + escapeHtml(msg.user) + "</span>" : "") +
            '<div class="nb-chat__bubble">' +
            '<span class="nb-chat__msg-text">' + escapeHtml(msg.text) + "</span>" +
            '<span class="nb-chat__msg-time">' + time + "</span>" +
            "</div>";

        messagesEl.appendChild(msgEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function changeName() {
        var newName = prompt("Escolhe o teu nome no chat:", currentUser);
        if (newName && newName.trim()) {
            currentUser = newName.trim().substring(0, 30);
            localStorage.setItem("nextbid_temp_name", currentUser);
            var el = document.getElementById("chat-username");
            if (el) el.textContent = currentUser;
        }
    }

    function setStatus(state) {
        var dot = document.getElementById("chat-status-dot");
        var text = document.getElementById("chat-status-text");
        if (!dot || !text) return;
        if (state === "online") {
            dot.classList.add("nb-chat__dot--online");
            text.textContent = "Ao vivo";
        } else {
            dot.classList.remove("nb-chat__dot--online");
            text.textContent = "Offline";
        }
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function formatTime(ts) {
        return new Date(ts).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    }
})();

