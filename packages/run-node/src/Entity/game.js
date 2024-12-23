"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
class Game {
    constructor({ ownerId, gameId, playerList, }) {
        this.currentStateData = null;
        this.playerList = [];
        this.ownerId = "";
        this.id = "";
        this.messageQueue = [];
        this.state = "uninit";
        this.ownerId = ownerId;
        this.id = gameId;
        this.playerList = playerList;
    }
    pushMessage(message) {
        this.messageQueue.push(message);
    }
}
exports.Game = Game;
