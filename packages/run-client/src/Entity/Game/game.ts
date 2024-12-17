type GameState = "waiting" | "started" | "finished";

type HorseColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "white"
  | "black";

type DiceType = "red" | "blue" | "green" | "yellow" | "purple" | "custom";

interface Board {
  // effects: BoardEffect[];
}

interface DiceResult {
  type: DiceType;
  color: HorseColor;
  value: number;
}

class Horse {
  color: HorseColor = "red";
  position: number = 0;
  zPosition: number = 0;
  upper: Horse | null = null;
  under: Horse | null = null;

  constructor({
    color = "red",
    position = 0,
    zPosition = 0,
  }: { color?: HorseColor; position?: number; zPosition?: number } = {}) {
    this.color = color;
    this.position = position;
    this.zPosition = zPosition;
  }
}

const DEFAULT_HOUSE_COLOR: HorseColor[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "white",
  "black",
];

const DEFAULT_DICE: DiceType[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "custom",
];

const BOARD_COUNT = 19;

interface IClientGameData {
  id: string;
  turn: number;
  stage: number;
  state: GameState;
  remindDices: DiceType[];
}

interface IClientBoardData {
  boardList: Board[];
}

interface IClientPlayerData {}

interface ITurnLotteryCard {
  color: "red" | "blue" | "green" | "yellow" | "purple";
  value: number;
  ownerId: string;
}

interface IPlayer {
  id: string;
  ws: WebSocket;
}

class Turn {
  // 当前回合数
  turn: number = 0;
  currentPlayerId: string = "";
  // 剩余可被掷出的骰子
  remindDices: DiceType[] = [...DEFAULT_DICE];

  remainLotteryCardMap: Map<ITurnLotteryCard["color"], ITurnLotteryCard[]> =
    new Map();

  constructor({ currentPlayerId = "" }) {
    this.remainLotteryCardMap = new Map([
      [
        "red",
        Array(5)
          .fill({ color: "red", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
      [
        "blue",
        Array(5)
          .fill({ color: "blue", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
      [
        "green",
        Array(5)
          .fill({ color: "green", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
      [
        "yellow",
        Array(5)
          .fill({ color: "yellow", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
      [
        "purple",
        Array(5)
          .fill({ color: "purple", value: 2, ownerId: "" })
          .map((card, i) => ({
            ...card,
            value: i === 0 ? 5 : i === 1 ? 3 : 2,
          })),
      ],
    ]);
    this.currentPlayerId = currentPlayerId;
  }

  public choiceLotteryCard(playerId: string, color: ITurnLotteryCard["color"]) {
    const cards = this.remainLotteryCardMap.get(color);
    if (!cards || cards.length === 0) {
      return null;
    }
    const card = cards.pop();
    if (!card) {
      return null;
    }
    return card;
  }
}

export class Game {
  id: string = "";
  // players: Player[];
  turn: number = 0;
  stage: number = 0;
  state: GameState = "waiting";
  horseMap: Map<HorseColor, Horse> = new Map();
  boardList: Board[] = new Array(BOARD_COUNT).fill({ effects: [] });
  // 剩余可被掷出的骰子
  remindDices: DiceType[] = [...DEFAULT_DICE];
  // 当前操作的玩家
  currentPlayerId: string = "";
  playerList: IPlayer[] = [];
  isInit: boolean = false;

  constructor() {
    // this.id = uuid.generate();
    this.id = "test_game_id";
    
    this.init();
  }

  public init() {
    this.turn = 0;
    this.remindDices = [...DEFAULT_DICE];
    DEFAULT_HOUSE_COLOR.forEach((color) => {
      this.horseMap.set(
        color,
        new Horse({
          color,
          position:
            color === "white" || color === "black" ? BOARD_COUNT + 1 : 0,
        })
      );
    });
    for (let i = 0; i < 6; i++) {
      this.diceAndMove();
    }

    this.remindDices = [...DEFAULT_DICE];
    this.isInit = true;
  }

  public join({ id, ws }: { id: string; ws: WebSocket }) {
    // 如果 playList 中已存在 userId，则更新 ws
    const player = this.playerList.find((p) => p.id === id);
    if (player) {
      player.ws = ws;
      return;
    }
    this.playerList.push({ id, ws });
    this.currentPlayerId = this.playerList[0].id;
  }

  /**
   * 从 remindDices 中随机取出一个骰子
   * 如果选出的是 `custom`，则需要在随机从 `white`、`black` 中选出一个颜色
   * 将选出的骰子从 remindDices 中移除
   * value 从 1-3 中随机选出
   * 返回选出的骰子
   */
  public dice(): DiceResult {
    const idx = Math.floor(Math.random() * this.remindDices.length);
    const type = this.remindDices[idx];
    const color =
      type === "custom" ? (Math.random() > 0.5 ? "white" : "black") : type;
    const value = Math.floor(Math.random() * 3) + 1;
    this.remindDices.splice(idx, 1);

    if (this.remindDices.length <= 1) {
      this.remindDices = [...DEFAULT_DICE];
    }
    return { type, color, value };
  }

  public getTopHorseByPosition(position: number): Horse | null {
    let top: Horse | null = null;
    this.horseMap.forEach((horse) => {
      if (horse.position === position) {
        top = horse;
        while (top?.upper) {
          top = top.upper;
        }
        return top;
      }
    });

    return top;
  }

  public moveHorse(horse: Horse, diceResult: DiceResult) {
    console.log("moveHorse", diceResult);
    const { value, type } = diceResult;
    const distance = type === "custom" ? -value : value;
    if (horse.under) {
      horse.under.upper = null;
      horse.under = null;
    }
    const nextPosition = horse.position + distance;

    // 如果移动后位置有马，则放在当前位置最上面马的上面
    const topHorse = this.getTopHorseByPosition(nextPosition);
    if (topHorse && topHorse !== horse) {
      topHorse.upper = horse;
      horse.under = topHorse;
    }

    // 更新当前马以及上面马的位置信息
    horse.position = nextPosition;
    let upper = horse.upper;
    while (upper) {
      upper.position = nextPosition;
      upper = upper.upper;
    }
  }

  public diceAndMove() {
    const diceResult = this.dice();
    const horse = this.horseMap.get(diceResult.color);
    if (horse) {
      this.moveHorse(horse, diceResult);
    }

    return diceResult;
  }

  /**
   * 根据 horse在 upper 和 under 位置计算 zPosition，最下面为0
   */
  public calcZPosition(horse: Horse) {
    let pos = 0;
    let under = horse.under;
    while (under) {
      pos--;
      under = under.under;
    }
    return -pos;
  }

  public nextCurrentPlayer() {
    const idx = this.playerList.findIndex(
      (player) => player.id === this.currentPlayerId
    );
    this.currentPlayerId =
      this.playerList[(idx + 1) % this.playerList.length].id;
  }

  // public nextStage() {
  //   this.stage++;
  //   this.currentPlayerId = this.playerList[this.stage % this.playerList.length];
  // }

  // public nextTurn() {
  //   this.turn++;
  //   this.stage = 0;
  //   this.currentPlayerId = this.playerList[this.stage % this.playerList.length];
  // }

  public transClientData() {
    const horseList: any[] = [];
    this.horseMap.forEach((horse) => {
      horseList.push({
        color: horse.color,
        position: horse.position,
        zPosition: this.calcZPosition(horse),
      });
    });

    return {
      id: this.id,
      horseList,
      remindDices: this.remindDices,
      currentPlayerId: this.currentPlayerId,
    };
  }
}
