"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomSliceReducer = void 0;
const RoomManager_1 = __importDefault(require("../Manager/RoomManager"));
const GameManager_1 = __importDefault(require("../Manager/GameManager"));
const Utils_1 = require("../Utils");
const notifyAllPlayer = ({ room, payload, action = "game" }) => {
    room.playerList.forEach(({ ws }) => {
        ws.send(JSON.stringify({
            action: action || "game",
            payload: payload,
        }));
    });
};
const roomSliceReducer = (action) => {
    return {
        init: (ws) => { },
        tick: ({ ws, payload }) => {
            const { userId, userName, roomId } = payload;
            const currentRoom = RoomManager_1.default.getRoomById(roomId);
            if (!currentRoom) {
                console.error("未找到指定房间 roomId:", +roomId);
                return;
            }
            currentRoom.enter({
                userId,
                userName,
                ws,
            });
            notifyAllPlayer({
                room: currentRoom,
                payload: currentRoom.transToClientData(),
                action: "tick",
            });
        },
        leave: ({ ws, payload }) => {
            const { userId, roomId } = payload;
            const currentRoom = RoomManager_1.default.getRoomById(roomId);
            if (!currentRoom) {
                console.error("未找到指定房间 roomId:", +roomId);
                return;
            }
            currentRoom.leave(userId);
            notifyAllPlayer({
                room: currentRoom,
                payload: currentRoom.transToClientData(),
                action: "leave",
            });
        },
        changeReady: ({ ws, payload }) => {
            const { userId, roomId } = payload;
            const currentRoom = RoomManager_1.default.getRoomById(roomId);
            if (!currentRoom) {
                console.error("未找到指定房间 roomId:", +roomId);
                return;
            }
            currentRoom.changeReady(userId);
            notifyAllPlayer({
                room: currentRoom,
                payload: currentRoom.transToClientData(),
                action: "changeReady",
            });
        },
        startGame: ({ ws, payload }) => {
            const { userId, roomId } = payload;
            const currentRoom = RoomManager_1.default.getRoomById(roomId);
            if (!currentRoom) {
                console.error("未找到指定房间 roomId:", +roomId);
                return;
            }
            // 生成 game id
            const gameId = (0, Utils_1.generateId)();
            GameManager_1.default.createGame({
                gameId,
                ownerId: currentRoom.ownerId,
                playerList: currentRoom.playerList,
            });
            notifyAllPlayer({
                room: currentRoom,
                payload: {
                    gameId,
                },
                action: "startGame",
            });
            currentRoom.gameStatus = "playing";
        },
    };
};
exports.roomSliceReducer = roomSliceReducer;
