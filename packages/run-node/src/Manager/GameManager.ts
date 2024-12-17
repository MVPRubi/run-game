import { Game, IPlayer } from "../Entity/game";

class GameManager {
  private static instance: GameManager | null = null;

  private gameMap: Map<string, Game> = new Map();

  private constructor() {
    // // 每秒20次的频率更新游戏状态
    // setInterval(() => {
    //   this.gameMap.forEach((game) => {
    //     // 递归执行 game 和 game 中属性的 update 方法
    //     game.update?.();
    //   });
    // }, 1000 / 20);
  }

  public static getInstance(): GameManager {
    if (GameManager.instance === null) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public createGame({
    gameId,
    ownerId,
    playerList = [],
  }: {
    gameId: string;
    ownerId: string;
    playerList?: IPlayer[];
  }): Game {
    if (this.gameMap.has(gameId)) {
      return this.gameMap.get(gameId) as Game;
    }
    const game = new Game({ gameId, ownerId, playerList });
    this.gameMap.set(game.id, game);
    return game;
  }

  public getGame(id: string): Game | undefined {
    return this.gameMap.get(id);
  }
}

const gameManager = GameManager.getInstance();

export default gameManager;
