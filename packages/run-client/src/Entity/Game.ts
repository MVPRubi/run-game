import { Vector3 } from "three";
import { GameEventEmitter, EventType } from "@event";
import { Horse, Board, BoardEffect } from "./Horse";
import { GamePlayer } from "./Player";
import { groupBy, sortBy } from "lodash-es";
import { DiceResult, NormalHorseColor } from "@types";
import { BOARD_HEIGHT_OFFSET } from "@constant";
import { randomInt } from "@utils";

const horseColorList: HorseColor[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "white",
  "black",
];

const mapToArray = (map: Map<any, any>) => {
  return Array.from(map.values());
};

const arrayToMap = (array: any[]) => {
  return new Map(array.map((item) => [item.id, item]));
};

const xLength = 3;
const yLength = 3;

export const isBottomHorse = (horse: Horse) => {
  return !horse.under;
};

export const getBottomHorse = (horse: Horse) => {
  let bottomHorse = horse;
  while (bottomHorse.under) {
    bottomHorse = bottomHorse.under;
  }
  return bottomHorse;
};

export const getTopHorse = (horse: Horse) => {
  let topHorse = horse;
  while (topHorse.upper) {
    topHorse = topHorse.upper;
  }
  return topHorse;
};

export class Game {
  id: string = "";
  state: "init" | "playing" | "end" = "init";
  initGame: boolean = false;
  horseMap: Map<string, Horse> = new Map();
  boardList: Board[] = [];
  playerMap: Map<string, GamePlayer> = new Map();
  playerList: IPlayer[] = [];
  // 房主 id
  ownerId: string = "";
  remindDiceType: DiceType[] = [...DEFAULT_DICE];
  diceResultList: DiceResult[] = [];
  turn: Turn = new Turn(0, "");
  currentStagePlayerId: string = "";
  finalCardList: IFinalCard[] = [];

  get playerIdList() {
    return this.playerList.map((player) => player.id);
  }

  constructor(gameId?: string) {
    if (gameId) {
      this.id = gameId;
    }
  }

  initWithGame(game: Game & { horseList: Horse[] }) {
    this.id = game.id;
    this.initGame = game.initGame;
    this.initHorseMapByHorseList(game.horseList);
    this.boardList = game.boardList.map((board) => new Board(board));
    this.playerMap = arrayToMap(
      game.playerList.map(({ id }) => new GamePlayer({ id }))
    );
    this.playerList = game.playerList;
    this.ownerId = game.ownerId;
    this.currentStagePlayerId = game.ownerId;
    this.turn.init({
      turn: 0,
      currentStagePlayerId: game.ownerId,
    });
  }

  /**
   * 根据 horseList 初始化 horseMap
   * 根据 boardIndex 和 order 初始化 horse 的 upper 和 under 关系
   * */
  initHorseMapByHorseList(horseList: Horse[]) {
    const horseMap = new Map<string, Horse>();
    // 先按照 boardIndex 分组
    const horseListByBoardIndex = groupBy(horseList, "boardIndex");

    // 再按照 order 排序，每个分组
    Object.keys(horseListByBoardIndex).forEach((boardIndex) => {
      const horseList = sortBy(horseListByBoardIndex[boardIndex], "order");
      let prevHorse: Horse | null = null;
      horseList.forEach((horse) => {
        const horseInst = new Horse(horse);
        if (prevHorse) {
          horseInst.under = prevHorse;
          prevHorse.upper = horseInst;
        }
        horseMap.set(horse.color, horseInst);
        prevHorse = horseInst;
      });
    });
    this.horseMap = horseMap;
  }

  init() {
    const boardList: Board[] = [];
    let index = 0;
    for (let x = xLength; x >= -xLength; x--) {
      boardList.push(
        new Board({
          position: new Vector3(x, BOARD_HEIGHT_OFFSET, yLength),
          index,
        })
      );
      index++;
    }
    for (let y = yLength - 1; y >= -yLength; y--) {
      boardList.push(
        new Board({
          position: new Vector3(-xLength, BOARD_HEIGHT_OFFSET, y),
          index,
        })
      );
      index++;
    }
    for (let x = -xLength + 1; x <= xLength; x++) {
      boardList.push(
        new Board({
          position: new Vector3(x, BOARD_HEIGHT_OFFSET, -yLength),
          index,
        })
      );
      index++;
    }
    for (let y = -yLength + 1; y <= yLength - 1; y++) {
      boardList.push(
        new Board({
          position: new Vector3(xLength, BOARD_HEIGHT_OFFSET, y),
          index,
        })
      );
      index++;
    }

    this.boardList = boardList;

    // 初始化 horseMap
    const horseMap = new Map<string, Horse>();

    // let prevHorse: Horse | null = null;
    const boardCount: Record<number, number> = {};
    horseColorList.forEach((color) => {
      const randomBoardIndex = randomInt(1, 4);
      boardCount[randomBoardIndex] = boardCount[randomBoardIndex]
        ? boardCount[randomBoardIndex] + 1
        : 1;
      const initBoardIndex =
        color === "black" || color === "white"
          ? this.boardList.length - 1 - randomBoardIndex
          : randomBoardIndex;
      const horse = new Horse({
        color,
        position: new Vector3(
          boardList[initBoardIndex].position.x,
          BOARD_HEIGHT_OFFSET,
          boardList[initBoardIndex].position.z
        ),
        boardIndex: initBoardIndex,
      });
      // if (prevHorse) {
      //   horse.under = prevHorse;
      //   prevHorse.upper = horse;
      // }
      // prevHorse = horse;
      horseMap.set(horse.color, horse);
    });

    this.horseMap = horseMap;
    this.initGame = true;
    this.state = "playing";
  }

  join(playerId: string) {
    const player = new GamePlayer({ id: playerId });
    if (!this.playerMap.has(playerId)) {
      this.playerMap.set(playerId, player);
    }
  }

  getBottomHorseByBoardIndex(index: number, excludeColor?: HorseColor) {
    const horseList = Array.from(this.horseMap.values());
    const bottomList = horseList
      .map((horse) => {
        if (horse.boardIndex === index) {
          return getBottomHorse(horse);
        }
      })
      .filter((horse) => horse && horse.color !== excludeColor);
    return bottomList[0];
  }

  isHorseMoving() {
    return Array.from(this.horseMap.values()).some(
      (horse) => horse.isHorseMoving
    );
  }

  handleHorseMoveEnd = ({ horse, cb }: { horse: Horse; cb: () => void }) => {
    const { boardIndex, effect } = horse;
    const selfBottomHorse = getBottomHorse(horse);
    const bottomHorse = this.getBottomHorseByBoardIndex(
      boardIndex,
      selfBottomHorse?.color
    );
    const currBoard = this.boardList[boardIndex];

    if (bottomHorse) {
      if (!effect || effect.type === "advance") {
        const topHorse = getTopHorse(bottomHorse);
        topHorse.upper = selfBottomHorse;
        selfBottomHorse.under = topHorse;

        // 调用当前位置全部 horse 的 updatePositionZ 方法
        let upper = bottomHorse.upper;
        while (upper) {
          upper.updatePositionY();
          upper = upper.upper;
        }
      } else if (effect.type === "back") {
        const selfTopHorse = getTopHorse(horse);
        selfTopHorse.upper = bottomHorse;
        bottomHorse.under = selfTopHorse;

        // 调用当前位置全部 horse 的 updatePositionZ 方法
        let upper = selfBottomHorse.upper;
        while (upper) {
          upper.updatePositionY();
          upper = upper.upper;
        }
      }
      horse.effect = null;
    }

    if (currBoard?.effect) {
      currBoard.effect.takeEffect(horse, this, cb);
    } else {
      cb();
    }
  };

  handleDice(diceResult: DiceResult) {
    const { type } = diceResult;
    const diceIndex = this.remindDiceType.findIndex((item) => item === type);
    if (diceIndex > -1) {
      this.remindDiceType.splice(diceIndex, 1);
    }
    this.diceResultList.push(diceResult);
    if (this.remindDiceType.length <= 1) {
      this.remindDiceType = [...DEFAULT_DICE];
    }
  }

  handleAddEffectToBoard({
    board,
    effect,
    playerId,
  }: {
    board: Board;
    effect: BoardEffect;
    playerId: string;
  }) {
    board.addEffect(
      new BoardEffect({
        ...effect,
        board: board,
      })
    );
    // TODO
    this.playerMap.get(playerId)?.clearEffect();
    return board.renderEffect(this.boardList.length);
  }

  gameOver() {
    this.state = "end";
  }

  clearDiceResult() {
    this.diceResultList = [];
  }

  addDiceResult(diceResult: DiceResult) {
    this.diceResultList.push(diceResult);
  }

  detectCanAddEffectToBoard(board: Board) {
    const { effect } = board;
    // 如果 board 上有 effect，或者 board 上有马，就不能添加 effect
    // 相邻 board 有 effect 也不能添加 effect
    if (effect) {
      return false;
    }
    const horse = this.getBottomHorseByBoardIndex(board.index);
    if (horse) {
      return false;
    }

    const prevBoard = this.boardList[board.index - 1];
    const nextBoard = this.boardList[board.index + 1];
    if ((prevBoard && prevBoard.effect) || (nextBoard && nextBoard.effect)) {
      return false;
    }

    return true;
  }

  addSelfEventListener() {
    GameEventEmitter.on("horseMoveEnd", this.handleHorseMoveEnd);
  }

  removeSelfEventListener() {
    GameEventEmitter.off("horseMoveEnd", this.handleHorseMoveEnd);
  }

  // 立即结算当前玩家分数
  settlementPlayerCoin() {
    const sortedHorseList = this.getHorseOrder();
    const playerTurnDataList = this.turn.playerTurnDataList;
    // 计算每个玩家的分数
    // playerTurnDataList 中的 coin 直接加到玩家的 coins 中
    // lotteryCardList 中的 card，如果马在第一位加卡片分数，在第二位加1分，其他扣一分
    playerTurnDataList.forEach((playerTurnData) => {
      const { lotteryCardList, coin, playerId } = playerTurnData;
      const score = lotteryCardList.reduce((total, card) => {
        const horseIndex = sortedHorseList.findIndex(
          (horse) => horse.color === card.color
        );
        if (horseIndex === 0) {
          return total + card.value;
        } else if (horseIndex === 1) {
          return total + 1;
        } else {
          return total - 1;
        }
      }, 0);
      if (score > 0) {
        GameEventEmitter.emit(EventType.addCoin, {
          playerId: playerId,
          coin: score,
        });
      }
      this.playerMap.get(playerId)?.addCoin(coin + score);
    });
  }

  nextTurn() {
    this.settlementPlayerCoin();

    this.turn.turn++;
    const nextPlayerId =
      this.playerIdList[
        (this.playerIdList.indexOf(this.turn.currentStagePlayerId) + 1) %
          this.playerIdList.length
      ];
    this.turn.init({
      turn: this.turn.turn,
      currentStagePlayerId: nextPlayerId,
    });

    // 清除 Board 上的 effect
    this.boardList.forEach((board) => {
      board.clearEffect();
    });

    // 重置用户 effect
    this.playerMap.forEach((player) => {
      player.initEffect();
    });
  }

  // 计算点前时间所有马的顺序，返回马数组
  getHorseOrder() {
    const needCalcHorseColor = ["red", "blue", "green", "yellow", "purple"];
    const horseList = Array.from(this.horseMap.values()).filter((horse) =>
      needCalcHorseColor.includes(horse.color)
    );
    // boardIndex 大的在前 getOrder 大的在前
    const sortedHorseList = sortBy(horseList, [
      (horse) => -horse.boardIndex,
      (horse) => -horse.getPosYOrder(),
    ]);

    return sortedHorseList;
  }

  // 设置下一个用户为当前用户
  takeTurnStagePlayer = () => {
    const nextPlayerId =
      this.playerIdList[
        (this.playerIdList.indexOf(this.currentStagePlayerId) + 1) %
          this.playerIdList.length
      ];

    this.currentStagePlayerId = nextPlayerId;
  };

  addFinalCard = (owner: string, color: NormalHorseColor) => {
    // 先从 playMap 中移除该觉得颜色的卡片
    // 再加入 finalCardList 中
    const player = this.playerMap.get(owner);
    if (!player) {
      return;
    }
    const cardIndex = player.finalCards.findIndex(
      (card) => card.color === color
    );
    if (cardIndex > -1) {
      const card = player.finalCards.splice(cardIndex, 1)[0];
      this.finalCardList.push({
        ...card,
        owner,
      });
    }
  };

  tryToNextTurn = () => {};
}

type DiceType = "red" | "blue" | "green" | "yellow" | "purple" | "custom";

const DEFAULT_DICE: DiceType[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "custom",
];

class PlayerTurnData {
  playerId: string = "";
  lotteryCardList: ITurnLotteryCard[] = [];
  // 金币数
  coin: number = 0;

  constructor({
    playerId,
    lotteryCardList,
    coin,
  }: {
    playerId: string;
    lotteryCardList: ITurnLotteryCard[];
    coin: number;
  }) {
    this.playerId = playerId;
    this.lotteryCardList = lotteryCardList;
    this.coin = coin;
  }

  setCoin(coin: number) {
    this.coin = coin;
  }

  setLotteryCardList(lotteryCardList: ITurnLotteryCard[]) {
    this.lotteryCardList = lotteryCardList;
  }
}

class Turn {
  // 回合数
  turn: number = 0;
  remindDices: DiceType[] = [...DEFAULT_DICE];
  currentStagePlayerId: string = "";
  remainLotteryCardMap: Map<ITurnLotteryCard["color"], ITurnLotteryCard[]> =
    new Map();
  playerTurnDataList: PlayerTurnData[] = [];

  constructor(turn: number, currentStagePlayerId: string) {
    this.turn = turn;
    this.currentStagePlayerId = currentStagePlayerId;
    // this.init();
  }

  init({
    turn,
    currentStagePlayerId,
  }: {
    turn: number;
    currentStagePlayerId: string;
  }) {
    this.turn = turn;
    this.currentStagePlayerId = currentStagePlayerId || "";
    this.remindDices = [...DEFAULT_DICE];
    const cardCount = 4;
    this.remainLotteryCardMap = new Map([
      [
        "red",
        Array(cardCount)
          .fill({ color: "red", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
      [
        "blue",
        Array(cardCount)
          .fill({ color: "blue", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
      [
        "green",
        Array(cardCount)
          .fill({ color: "green", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
      [
        "yellow",
        Array(cardCount)
          .fill({ color: "yellow", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
      [
        "purple",
        Array(cardCount)
          .fill({ color: "purple", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
    ]);
    this.playerTurnDataList = [];
  }

  setCurrentStagePlayerId(playerId: string) {
    this.currentStagePlayerId = playerId;
  }

  getPlayerTurnData(playerId: string) {
    return this.playerTurnDataList.find((item) => item.playerId === playerId);
  }

  addCardToPlayer(playerId: string, cardColor: NormalHorseColor) {
    const playerTurnData = this.getPlayerTurnData(playerId);
    const card = this.remainLotteryCardMap.get(cardColor)?.shift();
    if (!card) {
      return;
    }
    GameEventEmitter.emit(EventType.addCard, {
      playerId,
      card,
    });
    if (playerTurnData) {
      playerTurnData.lotteryCardList.push(card);
    } else {
      this.playerTurnDataList.push(
        new PlayerTurnData({
          playerId,
          lotteryCardList: [card],
          coin: 0,
        })
      );
    }
  }

  addCoinToPlayer(playerId: string, coin: number) {
    const playerTurnData = this.getPlayerTurnData(playerId);
    GameEventEmitter.emit(EventType.addCoin, {
      playerId,
      coin,
    });
    if (playerTurnData) {
      playerTurnData.coin += coin;
    } else {
      this.playerTurnDataList.push(
        new PlayerTurnData({
          playerId,
          lotteryCardList: [],
          coin,
        })
      );
    }
  }

  removeFromRemainLotteryCardMap = (card: ITurnLotteryCard) => {
    const cardList = this.remainLotteryCardMap.get(card.color);
    if (cardList) {
      const index = cardList.findIndex((item) => item.value === card.value);
      if (index > -1) {
        cardList.splice(index, 1);
      }
    }
  };
}
