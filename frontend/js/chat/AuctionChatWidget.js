
class AuctionChatWidget {
  constructor({ container, client, currentUser, maxMessages = 200, auctionTitle = "" }) {
    this.container = container;
    this.client = client;
    this.currentUser = currentUser;
    this.maxMessages = maxMessages;
    this.auctionTitle = auctionTitle;
    this._messageCount = 0;
    this._typingUsers = [];
    this._typingTimer = null;
    this._isTyping = false;
    this._presence = { count: 0, users: [] };
    this._collapsed = false;
    this._unread = 0;
  }

  mount() {
    this._injectStyles();
    this._render();
    this._bindUI();
    this._bindClient();
  }

  unmount() {
    this.container.innerHTML = "";
  }

  _render() {
    this.container.innerHTML = `
      <div class="ac-widget" id="ac-widget">
        <div class="ac-header" id="ac-header">
          <div class="ac-header-left">
            <div class="ac-live-dot"></div>
            <span class="ac-title">${this._escapeHtml(this.auctionTitle || "Chat ao Vivo")}</span>
          </div>
          <div class="ac-header-right">
            <div class="ac-presence" id="ac-presence" title="Utilizadores online">
              <span class="ac-presence-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
              <span id="ac-presence-count">0</span>
            </div>
            <button class="ac-icon-btn" id="ac-toggle" title="Minimizar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="ac-body" id="ac-body">
          <div class="ac-status-bar" id="ac-status">
            <span class="ac-status-dot connecting"></span>
            <span id="ac-status-text">A ligar...</span>
          </div>

          <div class="ac-messages" id="ac-messages" role="log" aria-live="polite" aria-label="Mensagens do chat">
            <div class="ac-welcome">
              <div class="ac-welcome-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p>Chat em direto do leilão. As mensagens são temporárias.</p>
            </div>
          </div>

          <div class="ac-typing-area" id="ac-typing" aria-live="polite"></div>

          <div class="ac-input-area">
            <textarea
              id="ac-input"
              class="ac-input"
              placeholder="Escreve uma mensagem…"
              maxlength="500"
              rows="1"
              aria-label="Escrever mensagem"
            ></textarea>
            <button class="ac-send-btn" id="ac-send" title="Enviar (Enter)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="ac-char-count"><span id="ac-chars">0</span>/500</div>
        </div>

        <div class="ac-unread-badge" id="ac-unread" style="display:none">0</div>
      </div>
    `;
  }


  _bindUI() {
    const input = this._el("ac-input");
    const send = this._el("ac-send");
    const toggle = this._el("ac-toggle");

    send.addEventListener("click", () => this._handleSend());

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this._handleSend();
      }
    });

    input.addEventListener("input", () => {
      this._autoResize(input);
      this._el("ac-chars").textContent = input.value.length;
      this._handleTypingInput();
    });

    toggle.addEventListener("click", () => this._toggleCollapse());
    this._el("ac-header").addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      this._toggleCollapse();
    });
  }


  _bindClient() {
    this.client.on("state_change", ({ state, reason }) => {
      this._updateStatus(state, reason);
    });

    this.client.on("message", (msg) => {
      this._appendMessage(msg);
      if (this._collapsed) {
        this._unread++;
        const badge = this._el("ac-unread");
        badge.textContent = this._unread > 99 ? "99+" : this._unread;
        badge.style.display = "flex";
      }
    });

    this.client.on("presence", (data) => {
      this._presence = data;
      this._el("ac-presence-count").textContent = data.count;
    });

    this.client.on("typing", ({ typing }) => {
      this._typingUsers = typing.filter(id => id !== this.currentUser.userId);
      this._renderTyping();
    });

    this.client.on("server_error", ({ code, message }) => {
      if (code === "FLOOD_KICK") {
        this._appendSystem("⚠️ Demasiadas mensagens. Desconectado.");
      }
    });
  }


  _appendMessage(msg) {
    const messages = this._el("ac-messages");
    const isMe = msg.userId === this.currentUser.userId;

    const welcome = messages.querySelector(".ac-welcome");
    if (welcome) welcome.remove();

    this._messageCount++;
    if (this._messageCount > this.maxMessages) {
      const oldest = messages.querySelector(".ac-msg");
      if (oldest) { oldest.remove(); this._messageCount--; }
    }

    const time = new Date(msg.timestamp).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    const initials = this._getInitials(msg.username);
    const colorClass = this._getUserColor(msg.userId);

    const el = document.createElement("div");
    el.className = `ac-msg ${isMe ? "ac-msg--me" : "ac-msg--them"}`;
    el.setAttribute("data-msg-id", msg.id);

    if (!isMe) {
      el.innerHTML = `
        <div class="ac-avatar ${colorClass}" aria-hidden="true">${initials}</div>
        <div class="ac-msg-content">
          <div class="ac-msg-meta">
            <span class="ac-msg-author">${this._escapeHtml(msg.username)}</span>
            <span class="ac-msg-time">${time}</span>
          </div>
          <div class="ac-bubble">${this._escapeHtml(msg.text)}</div>
        </div>`;
    } else {
      el.innerHTML = `
        <div class="ac-msg-content">
          <div class="ac-msg-meta ac-msg-meta--me">
            <span class="ac-msg-time">${time}</span>
            <span class="ac-msg-author">Tu</span>
          </div>
          <div class="ac-bubble ac-bubble--me">${this._escapeHtml(msg.text)}</div>
        </div>`;
    }

    messages.appendChild(el);
    this._scrollToBottom(messages);
  }

  _appendSystem(text) {
    const messages = this._el("ac-messages");
    const el = document.createElement("div");
    el.className = "ac-msg-system";
    el.textContent = text;
    messages.appendChild(el);
    this._scrollToBottom(messages);
  }

  _renderTyping() {
    const area = this._el("ac-typing");
    if (this._typingUsers.length === 0) {
      area.innerHTML = "";
      return;
    }
    const label = this._typingUsers.length === 1
      ? "alguém está a escrever…"
      : `${this._typingUsers.length} pessoas estão a escrever…`;
    area.innerHTML = `
      <div class="ac-typing-indicator">
        <span class="ac-typing-dots"><span></span><span></span><span></span></span>
        <span class="ac-typing-text">${label}</span>
      </div>`;
  }

  _updateStatus(state, reason) {
    const dot = this.container.querySelector(".ac-status-dot");
    const text = this._el("ac-status-text");
    const bar = this._el("ac-status");
    const input = this._el("ac-input");
    const send = this._el("ac-send");

    const states = {
      connecting: ["connecting", "A ligar..."],
      connected: ["connected", "Ligado"],
      disconnected: ["disconnected", "Desligado — a reconectar…"],
      error: ["error", "Erro de ligação"],
    };
    const [cls, label] = states[state] || ["disconnected", state];
    dot.className = `ac-status-dot ${cls}`;
    text.textContent = label;

    const isConnected = state === "connected";
    input.disabled = !isConnected;
    send.disabled = !isConnected;
    bar.style.display = state === "connected" ? "none" : "flex";
  }

  _handleTypingInput() {
    if (!this._isTyping) {
      this._isTyping = true;
      this.client.sendTypingStart();
    }
    clearTimeout(this._typingTimer);
    this._typingTimer = setTimeout(() => {
      this._isTyping = false;
      this.client.sendTypingStop();
    }, 2000);
  }

  async _handleSend() {
    const input = this._el("ac-input");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    input.style.height = "";
    this._el("ac-chars").textContent = "0";
    this._isTyping = false;
    clearTimeout(this._typingTimer);
    this.client.sendTypingStop();

    try {
      await this.client.sendMessage(text);
    } catch (err) {
      if (err.message === "RATE_LIMITED") {
        this._appendSystem("⏱ Estás a enviar mensagens muito rápido. Aguarda um momento.");
      } else {
        this._appendSystem(`Erro ao enviar: ${err.message}`);
      }
    }
  }

  _toggleCollapse() {
    this._collapsed = !this._collapsed;
    const body = this._el("ac-body");
    const toggle = this._el("ac-toggle");
    const badge = this._el("ac-unread");

    body.style.display = this._collapsed ? "none" : "flex";
    toggle.style.transform = this._collapsed ? "rotate(180deg)" : "";

    if (!this._collapsed) {
      this._unread = 0;
      badge.style.display = "none";
      this._scrollToBottom(this._el("ac-messages"));
    }
  }

  _el(id) { return this.container.querySelector(`#${id}`); }

  _scrollToBottom(el) {
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }

  _autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  }

  _escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  _getInitials(name) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }

  _getUserColor(userId) {
    const colors = ["ac-av--purple", "ac-av--teal", "ac-av--coral", "ac-av--blue", "ac-av--pink", "ac-av--amber"];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  _injectStyles() {
    if (document.getElementById("ac-styles")) return;
    const style = document.createElement("style");
    style.id = "ac-styles";
    style.textContent = `
      .ac-widget {
        display: flex; flex-direction: column;
        width: 100%; height: 100%;
        border: 1px solid #e2e0d8;
        border-radius: 12px; overflow: hidden;
        font-family: system-ui, -apple-system, sans-serif;
        background: #ffffff; font-size: 14px;
        color: #1a1a1a; position: relative;
      }
      .ac-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 14px; background: #1a1033;
        cursor: pointer; user-select: none; flex-shrink: 0;
      }
      .ac-header-left { display: flex; align-items: center; gap: 8px; }
      .ac-header-right { display: flex; align-items: center; gap: 6px; }
      .ac-live-dot {
        width: 8px; height: 8px; border-radius: 50%; background: #ef4444;
        animation: ac-pulse 1.5s infinite;
      }
      @keyframes ac-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      .ac-title { font-size: 13px; font-weight: 500; color: #fff; letter-spacing: 0.2px; }
      .ac-presence {
        display: flex; align-items: center; gap: 4px;
        font-size: 12px; color: rgba(255,255,255,0.7);
      }
      .ac-icon-btn {
        width: 28px; height: 28px; border: none; background: rgba(255,255,255,0.1);
        border-radius: 6px; cursor: pointer; color: rgba(255,255,255,0.8);
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, transform 0.2s;
      }
      .ac-icon-btn:hover { background: rgba(255,255,255,0.2); }
      .ac-body {
        display: flex; flex-direction: column; flex: 1; overflow: hidden;
        background: #f8f7f4;
      }
      .ac-status-bar {
        display: flex; align-items: center; gap: 6px;
        padding: 6px 12px; font-size: 12px; background: #fff;
        border-bottom: 1px solid #e2e0d8;
      }
      .ac-status-dot {
        width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
      }
      .ac-status-dot.connecting { background: #f59e0b; animation: ac-pulse 1s infinite; }
      .ac-status-dot.connected { background: #10b981; }
      .ac-status-dot.disconnected { background: #6b7280; }
      .ac-status-dot.error { background: #ef4444; }
      .ac-messages {
        flex: 1; overflow-y: auto; padding: 12px;
        display: flex; flex-direction: column; gap: 10px;
        scroll-behavior: smooth;
      }
      .ac-messages::-webkit-scrollbar { width: 4px; }
      .ac-messages::-webkit-scrollbar-thumb { background: #d1cfca; border-radius: 2px; }
      .ac-welcome {
        display: flex; flex-direction: column; align-items: center;
        gap: 8px; padding: 24px 16px; text-align: center;
        color: #9ca3af; font-size: 13px;
      }
      .ac-welcome-icon {
        width: 40px; height: 40px; border-radius: 50%;
        background: #eeecf6; color: #534ab7;
        display: flex; align-items: center; justify-content: center;
      }
      .ac-msg { display: flex; gap: 8px; align-items: flex-start; }
      .ac-msg--me { flex-direction: row-reverse; }
      .ac-msg-content { display: flex; flex-direction: column; max-width: 80%; }
      .ac-msg--me .ac-msg-content { align-items: flex-end; }
      .ac-msg-meta {
        display: flex; gap: 6px; align-items: baseline;
        margin-bottom: 3px; padding: 0 2px;
      }
      .ac-msg-meta--me { flex-direction: row-reverse; }
      .ac-msg-author { font-size: 11px; font-weight: 500; color: #6b7280; }
      .ac-msg-time { font-size: 10px; color: #9ca3af; }
      .ac-bubble {
        background: #fff; border: 1px solid #e2e0d8;
        border-radius: 14px; border-bottom-left-radius: 4px;
        padding: 8px 12px; font-size: 13.5px; line-height: 1.5;
        color: #1a1a1a; word-break: break-word; white-space: pre-wrap;
      }
      .ac-bubble--me {
        background: #2d1f5e; color: #fff; border: none;
        border-radius: 14px; border-bottom-right-radius: 4px;
      }
      .ac-avatar {
        width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 500; margin-top: 18px;
      }
      .ac-av--purple { background: #eeedfe; color: #3c3489; }
      .ac-av--teal   { background: #e1f5ee; color: #0f6e56; }
      .ac-av--coral  { background: #faece7; color: #993c1d; }
      .ac-av--blue   { background: #e6f1fb; color: #185fa5; }
      .ac-av--pink   { background: #fbeaf0; color: #993556; }
      .ac-av--amber  { background: #faeeda; color: #854f0b; }
      .ac-msg-system {
        text-align: center; font-size: 11px; color: #9ca3af;
        padding: 4px 12px; font-style: italic;
      }
      .ac-typing-area { min-height: 22px; padding: 0 14px 4px; }
      .ac-typing-indicator { display: flex; align-items: center; gap: 6px; }
      .ac-typing-dots { display: flex; gap: 3px; }
      .ac-typing-dots span {
        width: 5px; height: 5px; border-radius: 50%; background: #9ca3af;
        animation: ac-bounce 1.2s infinite;
      }
      .ac-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .ac-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes ac-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
      .ac-typing-text { font-size: 11px; color: #9ca3af; font-style: italic; }
      .ac-input-area {
        display: flex; gap: 8px; align-items: flex-end;
        padding: 8px 10px 6px; border-top: 1px solid #e2e0d8; background: #fff;
      }
      .ac-input {
        flex: 1; border: 1px solid #e2e0d8; border-radius: 8px;
        padding: 7px 11px; font-size: 13.5px; resize: none;
        outline: none; font-family: inherit; color: #1a1a1a;
        background: #f8f7f4; line-height: 1.4; min-height: 34px; max-height: 80px;
        transition: border-color 0.15s;
      }
      .ac-input:focus { border-color: #534ab7; background: #fff; }
      .ac-input::placeholder { color: #b0adb8; }
      .ac-input:disabled { opacity: 0.5; cursor: not-allowed; }
      .ac-send-btn {
        width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
        background: #2d1f5e; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #fff; transition: background 0.15s, transform 0.1s;
      }
      .ac-send-btn:hover { background: #534ab7; }
      .ac-send-btn:active { transform: scale(0.92); }
      .ac-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .ac-char-count {
        text-align: right; font-size: 10px; color: #c4c0cc;
        padding: 0 12px 6px; background: #fff;
      }
      .ac-unread-badge {
        position: absolute; top: -6px; right: -6px;
        background: #ef4444; color: #fff; font-size: 11px; font-weight: 500;
        border-radius: 10px; padding: 2px 6px; min-width: 20px;
        text-align: center; border: 2px solid #fff;
        display: flex; align-items: center; justify-content: center;
      }
      @media (max-width: 480px) {
        .ac-bubble { font-size: 13px; }
        .ac-msg-content { max-width: 90%; }
      }
    `;
    document.head.appendChild(style);
  }
}
