import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    onChildAdded,
    query,
    orderByChild,
    limitToLast,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "nextbid-chat.firebaseapp.com",
    databaseURL: "https://nextbid-chat-default-rtdb.firebaseio.com",
    projectId: "nextbid-chat",
    storageBucket: "nextbid-chat.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef",
};
function getCurrentUser() {
    const savedUser = localStorage.getItem("nextbid_user");
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            return parsed.username || parsed.name || "Utilizador";
        } catch (_) {}
    }
    const tempName = localStorage.getItem("nextbid_temp_name");
    if (tempName) return tempName;

    const names = ["Comprador", "Licitante", "Visitante"];
    const random = names[Math.floor(Math.random() * names.length)];
    const id = Math.floor(Math.random() * 999) + 1;
    const generated = `${random}${id}`;
    localStorage.setItem("nextbid_temp_name", generated);
    return generated;
}

let db = null;
let chatRef = null;
let currentUser = null;
let auctionId = null;

function initChat(auctionIdParam) {
    auctionId = auctionIdParam;
    currentUser = getCurrentUser();

    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);

    chatRef = ref(db, `chats/${auctionId}`);

    renderChatUI();
    listenForMessages();
    updateOnlineStatus();
}

function renderChatUI() {
    const container = document.getElementById("auction-chat");
    if (!container) {
        console.warn("[NextBid Chat] Elemento #auction-chat não encontrado.");
        return;
    }

    container.innerHTML = `
    <div class="nb-chat">
      <div class="nb-chat__header">
        <div class="nb-chat__title">
          <span class="nb-chat__icon">💬</span>
          Chat do Leilão
        </div>
        <div class="nb-chat__status">
          <span class="nb-chat__dot" id="chat-status-dot"></span>
          <span class="nb-chat__status-text" id="chat-status-text">A conectar...</span>
        </div>
      </div>

      <div class="nb-chat__user-bar">
        A participar como: <strong id="chat-username">${escapeHtml(currentUser)}</strong>
        <button class="nb-chat__change-name" id="btn-change-name" title="Alterar nome">✏️</button>
      </div>

      <div class="nb-chat__messages" id="chat-messages" role="log" aria-live="polite" aria-label="Mensagens do chat">
        <div class="nb-chat__empty" id="chat-empty">
          Sê o primeiro a escrever algo sobre este leilão!
        </div>
      </div>

      <div class="nb-chat__input-area">
        <input
          type="text"
          id="chat-input"
          class="nb-chat__input"
          placeholder="Escreve uma mensagem..."
          maxlength="300"
          autocomplete="off"
          aria-label="Escreve uma mensagem"
        />
        <button id="chat-send" class="nb-chat__send" aria-label="Enviar mensagem">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;

    document.getElementById("chat-send").addEventListener("click", sendMessage);
    document.getElementById("chat-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    document.getElementById("btn-change-name").addEventListener("click", changeName);
}

function listenForMessages() {
    if (!chatRef) return;
    const recentQuery = query(chatRef, orderByChild("timestamp"), limitToLast(50));

    onChildAdded(recentQuery, (snapshot) => {
        const msg = snapshot.val();
        if (msg) appendMessage(msg);
    });

    setTimeout(() => setStatus("online"), 800);
}

async function sendMessage() {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();

    if (!text || text.length < 1) return;

    const sendBtn = document.getElementById("chat-send");
    sendBtn.disabled = true;
    input.value = "";

    try {
        await push(chatRef, {
            user: currentUser,
            text: text,
            timestamp: Date.now(),
        });
    } catch (err) {
        console.error("[NextBid Chat] Erro ao enviar:", err);
        showToast("Não foi possível enviar. Verifica a ligação.");
        input.value = text;
    } finally {
        sendBtn.disabled = false;
        input.focus();
    }
}

function appendMessage(msg) {
    const messagesEl = document.getElementById("chat-messages");
    const emptyEl = document.getElementById("chat-empty");

    if (!messagesEl) return;

    if (emptyEl) emptyEl.remove();

    const isOwn = msg.user === currentUser;
    const time = formatTime(msg.timestamp);

    const msgEl = document.createElement("div");
    msgEl.className = `nb-chat__msg ${isOwn ? "nb-chat__msg--own" : ""}`;
    msgEl.innerHTML = `
    ${!isOwn ? `<span class="nb-chat__msg-user">${escapeHtml(msg.user)}</span>` : ""}
    <div class="nb-chat__bubble">
      <span class="nb-chat__msg-text">${escapeHtml(msg.text)}</span>
      <span class="nb-chat__msg-time">${time}</span>
    </div>
  `;

    messagesEl.appendChild(msgEl);

    messagesEl.scrollTop = messagesEl.scrollHeight;
}
function changeName() {
    const newName = prompt("Escolhe o teu nome no chat:", currentUser);
    if (newName && newName.trim().length > 0) {
        currentUser = newName.trim().substring(0, 30);
        localStorage.setItem("nextbid_temp_name", currentUser);
        const usernameEl = document.getElementById("chat-username");
        if (usernameEl) usernameEl.textContent = currentUser;
    }
}

function setStatus(state) {
    const dot = document.getElementById("chat-status-dot");
    const text = document.getElementById("chat-status-text");
    if (!dot || !text) return;

    if (state === "online") {
        dot.classList.add("nb-chat__dot--online");
        text.textContent = "Ao vivo";
    } else {
        dot.classList.remove("nb-chat__dot--online");
        text.textContent = "Offline";
    }
}

function updateOnlineStatus() {
    window.addEventListener("online", () => setStatus("online"));
    window.addEventListener("offline", () => setStatus("offline"));
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

function showToast(msg) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.cssText =
        "position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:.5rem 1rem;border-radius:8px;z-index:9999;font-size:14px;";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
export { initChat };

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDKL1xP7KhVNSjoggElcOnvLRhnQuiDrYA",
    authDomain: "nextbid-chat.firebaseapp.com",
    databaseURL: "https://nextbid-chat-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "nextbid-chat",
    storageBucket: "nextbid-chat.firebasestorage.app",
    messagingSenderId: "646254556760",
    appId: "1:646254556760:web:e0624dc453f4061057bc2d",
    measurementId: "G-19WJJ2PR8S"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { initChat } from 'NextBid/frontend/js/chat/chat.js';

const auctionId = urlParams.get('id');
initChat(auctionId);