import gameManager from "../Manager/GameManager";
import { IMessage } from "../Entity/game";

const notifyAllPlayer = ({
  game,
  payload,
  action = "game",
  addMessageQueue = true,
}) => {
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
  const game = gameManager.getGame(gameId);
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

export const gameSliceReducer = (action) => {
  return {
    create: ({ ws, payload }) => {
      const { gameId, userName, userId } = payload;
      let game = gameManager.getGame(gameId);

      if (!game) {
        game = gameManager.createGame({ gameId, ownerId: userId });
        game.playerList = [{ id: userId, ws, name: userName }];
      } else {
        // 如果存在用户更新 ws，不存在则添加
        const player = game.playerList.find((p) => p.id === userId);
        if (player) {
          player.ws = ws;
        } else {
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

      if (game?.ownerId !== userId) {
        return;
      }

      const ownerWs = game.playerList.find((p) => p.id === game?.ownerId)?.ws;

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
      const game = gameManager.getGame(gameId);
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
      const game = gameManager.getGame(gameId);
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
