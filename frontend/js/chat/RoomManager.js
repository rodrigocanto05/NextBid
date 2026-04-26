
export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  _getOrCreateRoom(auctionId) {
    if (!this.rooms.has(auctionId)) {
      this.rooms.set(auctionId, {
        auctionId,
        users: new Map(),     
        typing: new Set(),    
        createdAt: Date.now(),
      });
    }
    return this.rooms.get(auctionId);
  }

  addUser(auctionId, socketId, userInfo) {
    const room = this._getOrCreateRoom(auctionId);
    room.users.set(socketId, {
      userId: userInfo.userId,
      username: userInfo.username,
      avatar: userInfo.avatar || null,
      joinedAt: Date.now(),
      socketId,
    });
    return this.getPresence(auctionId);
  }

  removeUser(auctionId, socketId) {
    const room = this.rooms.get(auctionId);
    if (!room) return null;

    const user = room.users.get(socketId);
    if (user) {
      room.typing.delete(user.userId);
      room.users.delete(socketId);
    }

    if (room.users.size === 0) {
      this.rooms.delete(auctionId);
    }

    return { user, presence: this.getPresence(auctionId) };
  }

  setTyping(auctionId, userId, isTyping) {
    const room = this.rooms.get(auctionId);
    if (!room) return [];
    isTyping ? room.typing.add(userId) : room.typing.delete(userId);
    return [...room.typing];
  }

  getPresence(auctionId) {
    const room = this.rooms.get(auctionId);
    if (!room) return { count: 0, users: [] };
    return {
      count: room.users.size,
      users: [...room.users.values()].map(u => ({
        userId: u.userId,
        username: u.username,
        avatar: u.avatar,
      })),
    };
  }

  getUserBySocket(socketId) {
    for (const room of this.rooms.values()) {
      if (room.users.has(socketId)) {
        return { ...room.users.get(socketId), auctionId: room.auctionId };
      }
    }
    return null;
  }

  getRoomCount() {
    return this.rooms.size;
  }

  getTotalUsers() {
    let total = 0;
    for (const room of this.rooms.values()) total += room.users.size;
    return total;
  }
}
