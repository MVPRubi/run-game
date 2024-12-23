"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_1 = require("../Entity/room");
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    static getInstance() {
        if (RoomManager.instance === null) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }
    createRoom(ownerId) {
        const idx = this.rooms.size;
        const room = new room_1.Room(ownerId, `房间${idx + 1}`);
        this.rooms.set(room.id, room);
        return room;
    }
    getRoomByOwner(id) {
        return Array.from(this.rooms.values()).find(({ ownerId }) => ownerId === id);
    }
    getRoomList() {
        return Array.from(this.rooms.values());
    }
    getRoomById(roomId) {
        return this.rooms.get(roomId);
    }
}
RoomManager.instance = null;
const roomManager = RoomManager.getInstance();
exports.default = roomManager;
