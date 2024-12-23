"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameSliceReducer = void 0;
const GameManager_1 = __importDefault(require("../Manager/GameManager"));
const notifyAllPlayer = ({ game, payload, action = "game", addMessageQueue = true, }) => {
    const message = {
        action: action || "game",
        payload,
        timestamp: Date.now(),
    };
    if (addMessageQueue) {
        game.messageQueue.push(message);
    }
    game.playerList.forEach(({ ws }) => {
        ws.send(JSON.stringify(message));
    });
};
const notifySinglePlayer = ({ ws, game, payload, action = "game" }) => {
    const message = {
        action: action || "game",
        payload,
        timestamp: Date.now(),
    };
    ws.send(JSON.stringify(message));
};
const defaultAction = ({ ws, payload, action }) => {
    const { gameId } = payload;
    const game = GameManager_1.default.getGame(gameId);
    if (!game) {
        console.error("未找到指定游戏 id:", gameId);
        return;
    }
    notifyAllPlayer({
        game,
        payload,
        action,
    });
};
const gameSliceReducer = (action) => {
    return {
        create: ({ ws, payload }) => {
            var _a;
            const { gameId, userName, userId } = payload;
            let game = GameManager_1.default.getGame(gameId);
            if (!game) {
                game = GameManager_1.default.createGame({ gameId, ownerId: userId });
                game.playerList = [{ id: userId, ws, name: userName }];
            }
            else {
                // 如果存在用户更新 ws，不存在则添加
                const player = game.playerList.find((p) => p.id === userId);
                if (player) {
                    player.ws = ws;
                }
                else {
                    game.playerList.push({ id: userId, ws, name: userName });
                }
            }
            if (game.state === "playing") {
                notifySinglePlayer({
                    ws,
                    game,
                    payload: game.messageQueue,
                    action: "reconnect",
                });
                return;
            }
            if ((game === null || game === void 0 ? void 0 : game.ownerId) !== userId) {
                return;
            }
            const ownerWs = (_a = game.playerList.find((p) => p.id === (game === null || game === void 0 ? void 0 : game.ownerId))) === null || _a === void 0 ? void 0 : _a.ws;
            // 通知主机初始化游戏
            notifySinglePlayer({
                ws: ownerWs,
                game,
                payload: {
                    state: game.state,
                    ownerId: game.ownerId,
                },
                action: "create",
            });
        },
        init: ({ ws, payload, action }) => {
            const { gameId } = payload;
            const game = GameManager_1.default.getGame(gameId);
            if (!game) {
                console.error("未找到指定游戏 id:", gameId);
                return;
            }
            payload.game.ownerId = game.ownerId;
            payload.game.playerList = game.playerList.map(({ id, name }) => ({
                id,
                name,
            }));
            game.state = "playing";
            defaultAction({ ws, payload, action });
        },
        reconnect: ({ ws, payload, action }) => {
            const { gameId } = payload;
            const game = GameManager_1.default.getGame(gameId);
            if (!game) {
                console.error("未找到指定游戏 id:", gameId);
                return;
            }
            notifySinglePlayer({
                ws,
                game,
                payload: game.messageQueue,
                action,
            });
        },
        default: defaultAction,
    };
};
exports.gameSliceReducer = gameSliceReducer;
