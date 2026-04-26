

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cors from "cors";
import { RoomManager } from "./RoomManager.js";
import { RateLimiter } from "./RateLimiter.js";

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-production";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const MAX_MESSAGE_LENGTH = 500;
const TYPING_TIMEOUT_MS = 3000;


const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
  pingTimeout: 20000,
  pingInterval: 25000,
});

const rooms = new RoomManager();
const limiter = new RateLimiter({ capacity: 10, refillRate: 2, refillInterval: 1000 });
const typingTimers = new Map(); // socketId -> timer


io.use((socket, next) => {
  try {
    const raw = socket.handshake.auth?.token || socket.handshake.headers?.authorization || "";
    const token = raw.replace(/^Bearer\s+/i, "");
    if (!token) return next(new Error("AUTH_MISSING"));

    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = {
      userId: payload.sub,
      username: payload.username,
      avatar: payload.avatar || null,
      allowedAuctions: payload.allowedAuctions || [], // [] = allow all
    };
    next();
  } catch {
    next(new Error("AUTH_INVALID"));
  }
});


function sanitize(text) {
  return String(text)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, "&amp;")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

function validateAuctionAccess(user, auctionId) {
  if (!auctionId || typeof auctionId !== "string") return false;
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(auctionId)) return false;
  if (user.allowedAuctions.length === 0) return true;
  return user.allowedAuctions.includes(auctionId);
}

function clearTypingTimer(socketId) {
  if (typingTimers.has(socketId)) {
    clearTimeout(typingTimers.get(socketId));
    typingTimers.delete(socketId);
  }
}


io.on("connection", (socket) => {
  const { user } = socket;
  console.log(`[connect] ${user.username} (${socket.id})`);

  socket.on("join_auction", ({ auctionId }, ack) => {
    try {
      if (!validateAuctionAccess(user, auctionId)) {
        return ack?.({ error: "ACCESS_DENIED" });
      }

      const prev = rooms.getUserBySocket(socket.id);
      if (prev) {
        socket.leave(prev.auctionId);
        const { presence } = rooms.removeUser(prev.auctionId, socket.id);
        io.to(prev.auctionId).emit("presence_update", presence);
      }

      socket.join(auctionId);
      socket.currentAuction = auctionId;

      const presence = rooms.addUser(auctionId, socket.id, user);
      io.to(auctionId).emit("presence_update", presence);

      ack?.({ ok: true, presence });
      console.log(`[join] ${user.username} → auction:${auctionId} (${presence.count} online)`);
    } catch (err) {
      ack?.({ error: "SERVER_ERROR" });
    }
  });

  socket.on("send_message", ({ text }, ack) => {
    const auctionId = socket.currentAuction;
    if (!auctionId) return ack?.({ error: "NOT_IN_ROOM" });

    const { allowed, violations } = limiter.consume(user.userId, auctionId);

    if (!allowed) {
      if (violations >= 3) {
        socket.emit("error_event", { code: "FLOOD_KICK", message: "Too many messages. You have been disconnected." });
        socket.disconnect(true);
        return;
      }
      return ack?.({ error: "RATE_LIMITED" });
    }

    const cleanText = sanitize(text);
    if (!cleanText) return ack?.({ error: "EMPTY_MESSAGE" });

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: cleanText,
      userId: user.userId,
      username: user.username,
      avatar: user.avatar,
      timestamp: Date.now(),
      auctionId,
    };

    clearTypingTimer(socket.id);
    const typing = rooms.setTyping(auctionId, user.userId, false);
    socket.to(auctionId).emit("typing_update", { typing });

    io.to(auctionId).emit("new_message", message);
    ack?.({ ok: true, messageId: message.id });
  });

  socket.on("typing_start", () => {
    const auctionId = socket.currentAuction;
    if (!auctionId) return;

    clearTypingTimer(socket.id);
    const typing = rooms.setTyping(auctionId, user.userId, true);
    socket.to(auctionId).emit("typing_update", { typing });

    const timer = setTimeout(() => {
      const t = rooms.setTyping(auctionId, user.userId, false);
      socket.to(auctionId).emit("typing_update", { typing: t });
    }, TYPING_TIMEOUT_MS);
    typingTimers.set(socket.id, timer);
  });

  socket.on("typing_stop", () => {
    const auctionId = socket.currentAuction;
    if (!auctionId) return;
    clearTypingTimer(socket.id);
    const typing = rooms.setTyping(auctionId, user.userId, false);
    socket.to(auctionId).emit("typing_update", { typing });
  });

  socket.on("disconnect", (reason) => {
    clearTypingTimer(socket.id);
    limiter.remove(user.userId, socket.currentAuction);

    const auctionId = socket.currentAuction;
    if (auctionId) {
      const { presence } = rooms.removeUser(auctionId, socket.id);
      io.to(auctionId).emit("presence_update", presence);
    }
    console.log(`[disconnect] ${user.username} — ${reason}`);
  });
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.get("/stats", (_, res) => {
  res.json({
    rooms: rooms.getRoomCount(),
    connectedUsers: rooms.getTotalUsers(),
    socketCount: io.engine.clientsCount,
  });
});


app.post("/dev/token", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }
  const { userId, username, avatar, allowedAuctions = [] } = req.body;
  if (!userId || !username) return res.status(400).json({ error: "userId and username required" });
  const token = jwt.sign(
    { sub: userId, username, avatar, allowedAuctions },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
  res.json({ token });
});

setInterval(() => limiter.cleanup(), 5 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`\n🔴 Auction Chat Server running on :${PORT}`);
  console.log(`   Zero persistence mode — no messages are stored\n`);
});