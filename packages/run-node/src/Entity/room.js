"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const ws_1 = require("ws");
const lodash_1 = require("lodash");
const index_1 = require("../Utils/index");
const DEFAULT_NAME = "房间";
class Room {
    constructor(ownerId, name) {
        this.id = (0, index_1.generateId)();
        this.ownerId = "";
        this.name = DEFAULT_NAME;
        this.playerMap = new Map();
        this.gameStatus = "idle";
        this.ownerId = ownerId;
        this.name = name || DEFAULT_NAME;
    }
    get playerList() {
        return Array.from(this.playerMap.values());
    }
    enter({ userId, userName, ws, }) {
        this.playerMap.set(userId, {
            id: userId,
            name: userName,
            ws,
            state: userId === this.ownerId ? "ready" : "idle",
        });
    }
    leave(playerId) {
        this.playerMap.delete(playerId);
    }
    changeReady(playerId) {
        const player = this.playerMap.get(playerId);
        if (!player) {
            console.error("未找到指定玩家 playerId:", +playerId);
            return;
        }
        player.state = player.state === "ready" ? "idle" : "ready";
    }
    transToClientData() {
        const playerList = this.playerList
            .filter(({ ws }) => (ws === null || ws === void 0 ? void 0 : ws.readyState) === ws_1.WebSocket.OPEN)
            .map((_a) => {
            var { ws } = _a, other = __rest(_a, ["ws"]);
            return (Object.assign({}, other));
        });
        const data = Object.assign(Object.assign({}, (0, lodash_1.pick)(this, ["id", "name", "ownerId"])), { playerList });
        return data;
    }
    // 校验所有用户的 websocket 是否为关闭状态
    isAllUserWSClosed() {
        console.log("this.playerList", this.playerList.map(({ ws }) => ws === null || ws === void 0 ? void 0 : ws.readyState));
        return this.playerList.every(({ ws }) => (ws === null || ws === void 0 ? void 0 : ws.readyState) === ws_1.WebSocket.CLOSED);
    }
}
exports.Room = Room;
