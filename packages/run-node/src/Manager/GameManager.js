"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("../Entity/game");
class GameManager {
    constructor() {
        this.gameMap = new Map();
        // // 每秒20次的频率更新游戏状态
        // setInterval(() => {
        //   this.gameMap.forEach((game) => {
        //     // 递归执行 game 和 game 中属性的 update 方法
        //     game.update?.();
        //   });
        // }, 1000 / 20);
    }
    static getInstance() {
        if (GameManager.instance === null) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    createGame({ gameId, ownerId, playerList = [], }) {
        if (this.gameMap.has(gameId)) {
            return this.gameMap.get(gameId);
        }
        const game = new game_1.Game({ gameId, ownerId, playerList });
        this.gameMap.set(game.id, game);
        return game;
    }
    getGame(id) {
        return this.gameMap.get(id);
    }
}
GameManager.instance = null;
const gameManager = GameManager.getInstance();
exports.default = gameManager;
