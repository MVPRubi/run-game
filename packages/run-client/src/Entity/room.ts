import uuid from "short-uuid";
import { WebSocket } from "ws";
import { pick } from "lodash";

const DEFAULT_NAME = "房间";

interface IPlayer {
  id: string;
  ws: WebSocket;
  state: "ready" | "idle";
}

export class Room {
  id: string = uuid.generate();
  // playerList: string[] = [];
  ownerId = null;
  name: string = DEFAULT_NAME;
  wsList: WebSocket[] = [];
  playerMap: Map<string, IPlayer> = new Map();

  constructor(ownerId, name) {
    this.ownerId = ownerId;
    this.name = name || DEFAULT_NAME;
  }

  get playerList() {
    return Array.from(this.playerMap.values());
  }

  public enter(playerId: string, ws: WebSocket) {
    this.playerMap.set(playerId, {
      id: playerId,
      ws,
      state: playerId === this.ownerId ? "ready" : "idle",
    });

    console.log("enter:", this.playerMap);
  }

  public leave(playerId: string) {
    this.playerMap.delete(playerId);
  }

  public changeReady(playerId: string) {
    const player = this.playerMap.get(playerId);
    if (!player) {
      console.error("未找到指定玩家 playerId:", +playerId);
      return;
    }
    player.state = player.state === "ready" ? "idle" : "ready";
  }

  public transToClientData() {
    const playerList = this.playerList.map(({ id, state }) => ({
      id,
      state,
    }));
    return JSON.stringify({
      ...pick(this, ["id", "name", "ownerId"]),
      playerList,
    });
  }
}
