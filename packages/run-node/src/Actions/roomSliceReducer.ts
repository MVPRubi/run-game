import roomManager from "../Manager/RoomManager";
import gameManager from "../Manager/GameManager";
import { generateId } from "../Utils";

const notifyAllPlayer = ({ room, payload, action = "game" }) => {
  room.playerList.forEach(({ ws }) => {
    ws.send(
      JSON.stringify({
        action: action || "game",
        payload: payload,
      })
    );
  });
};

export const roomSliceReducer = (action) => {
  return {
    init: (ws) => {},
    tick: ({ ws, payload }) => {
      const { userId, userName, roomId } = payload;
      const currentRoom = roomManager.getRoomById(roomId);
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
      const currentRoom = roomManager.getRoomById(roomId);
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
      const currentRoom = roomManager.getRoomById(roomId);
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
      const currentRoom = roomManager.getRoomById(roomId);
      if (!currentRoom) {
        console.error("未找到指定房间 roomId:", +roomId);
        return;
      }
      // 生成 game id
      const gameId = generateId();
      gameManager.createGame({
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
