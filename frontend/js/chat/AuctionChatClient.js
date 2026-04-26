/**
 * AuctionChatClient
 * Frontend Socket.IO wrapper for ephemeral auction chat.
 * No message history is stored — messages live only in the DOM.
 *
 * Usage:
 *   const client = new AuctionChatClient({ serverUrl, token });
 *   await client.connect();
 *   await client.joinAuction("auction_123");
 *   client.on("message", handler);
 *   client.sendMessage("hello!");
 */
class AuctionChatClient extends EventTarget {
  constructor({ serverUrl, token, reconnectAttempts = 5 }) {
    super();
    this.serverUrl = serverUrl;
    this.token = token;
    this.reconnectAttempts = reconnectAttempts;
    this.socket = null;
    this.currentAuction = null;
    this._state = "disconnected"; // disconnected | connecting | connected | error
  }

  get state() { return this._state; }

  // ── Connection ─────────────────────────────────────────────────────────────

  connect() {
    return new Promise((resolve, reject) => {
      if (this._state === "connected") return resolve();

      // Dynamically load Socket.IO client from CDN if not available
      const initSocket = () => {
        this._state = "connecting";
        this._emit("state_change", { state: "connecting" });

        this.socket = io(this.serverUrl, {
          auth: { token: `Bearer ${this.token}` },
          transports: ["websocket", "polling"],
          reconnectionAttempts: this.reconnectAttempts,
          reconnectionDelay: 1500,
        });

        this.socket.on("connect", () => {
          this._state = "connected";
          this._emit("state_change", { state: "connected" });
          resolve();
        });

        this.socket.on("connect_error", (err) => {
          this._state = "error";
          this._emit("state_change", { state: "error", reason: err.message });
          if (err.message === "AUTH_INVALID" || err.message === "AUTH_MISSING") {
            reject(new Error(err.message));
          }
        });

        this.socket.on("disconnect", (reason) => {
          this._state = "disconnected";
          this._emit("state_change", { state: "disconnected", reason });
        });

        this._bindServerEvents();
      };

      if (typeof io !== "undefined") {
        initSocket();
      } else {
        const script = document.createElement("script");
        script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
        script.onload = initSocket;
        script.onerror = () => reject(new Error("Failed to load Socket.IO"));
        document.head.appendChild(script);
      }
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this._state = "disconnected";
    this.currentAuction = null;
  }

  // ── Room ──────────────────────────────────────────────────────────────────

  joinAuction(auctionId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) return reject(new Error("Not connected"));
      this.socket.emit("join_auction", { auctionId }, (res) => {
        if (res?.error) return reject(new Error(res.error));
        this.currentAuction = auctionId;
        resolve(res.presence);
      });
    });
  }

  // ── Messaging ─────────────────────────────────────────────────────────────

  sendMessage(text) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) return reject(new Error("Not connected"));
      if (!this.currentAuction) return reject(new Error("Not in a room"));
      const trimmed = text?.trim();
      if (!trimmed) return reject(new Error("Empty message"));

      this.socket.emit("send_message", { text: trimmed }, (res) => {
        if (res?.error) return reject(new Error(res.error));
        resolve(res);
      });
    });
  }

  sendTypingStart() {
    this.socket?.emit("typing_start");
  }

  sendTypingStop() {
    this.socket?.emit("typing_stop");
  }

  // ── Events ────────────────────────────────────────────────────────────────

  _bindServerEvents() {
    this.socket.on("new_message", (msg) => this._emit("message", msg));
    this.socket.on("presence_update", (data) => this._emit("presence", data));
    this.socket.on("typing_update", (data) => this._emit("typing", data));
    this.socket.on("error_event", (err) => this._emit("server_error", err));
  }

  /** Listen to client events: message, presence, typing, state_change, server_error */
  on(event, handler) {
    this.addEventListener(event, (e) => handler(e.detail));
    return this;
  }

  _emit(event, detail) {
    this.dispatchEvent(new CustomEvent(event, { detail }));
  }
}
