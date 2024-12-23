"use strict";
// import gameManager from "../Manager/GameManager";
// const notifyAllPlayer = (game, payload, action = "game") => {
//   game.playerList.forEach(({ ws }) => {
//     ws.send(
//       JSON.stringify({
//         action: action || "game",
//         payload: payload,
//       })
//     );
//   });
// };
// const sendMessageToAllPlayer = (game, message) => {
//   notifyAllPlayer(game, { message }, "message");
// };
// export const gameSliceReducer = (action) => {
//   return {
//     init: ({ ws, payload }) => {
//       const { userId, gameId } = payload;
//       const game = gameManager.createGame(gameId);
//       if (!game.isInit) {
//         game.init();
//       }
//       game.join({ id: userId, ws });
//       const gameData = game.transClientData();
//       notifyAllPlayer(game, { game: gameData });
//       sendMessageToAllPlayer(game, `玩家: ${userId} 加入游戏`);
//     },
//     restart: ({ payload }) => {
//       const { id } = payload;
//       const game = gameManager.getGame(id);
//       if (game) {
//         game.init();
//         notifyAllPlayer(game, { game: game.transClientData() });
//         sendMessageToAllPlayer(game, "重置成功");
//       }
//     },
//     choiceLotteryCard: () => {},
//     addSkipBoard: () => {},
//     dice: ({ ws, payload }) => {
//       const { gameId, userId } = payload;
//       const game = gameManager.getGame(gameId);
//       try {
//         if (game) {
//           const diceRes = game.diceAndMove();
//           game.nextCurrentPlayer();
//           // 通知 playerList 中的所有玩家
//           notifyAllPlayer(game, { game: game.transClientData() });
//           sendMessageToAllPlayer(
//             game,
//             `玩家 ${userId} , 投骰子 颜色：${diceRes.color} 值：${diceRes.value}`
//           );
//         } else {
//           console.error("未找到指定游戏 id:", gameId, gameManager);
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     },
//     leave: ({ ws, payload }) => {},
//     create: ({ ws, payload }) => {},
//   };
// };
