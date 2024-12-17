import { WebSocket } from "ws";
import { pick } from "lodash";
import { IPlayer } from "./game";
import {generateId} from "../Utils/index";

const DEFAULT_NAME = "房间";

export class Room {
  id: string = generateId();
  ownerId: string = "";
  name: string = DEFAULT_NAME;
  playerMap: Map<string, IPlayer> = new Map();
  gameStatus: "idle" | "playing" = "idle";

  constructor(ownerId, name) {
    this.ownerId = ownerId;
    this.name = name || DEFAULT_NAME;
  }

  get playerList() {
    return Array.from(this.playerMap.values());
  }

  public enter({
    userId,
    userName,
    ws,
  }: {
    userId: string;
    userName: string;
    ws: WebSocket;
  }) {
    this.playerMap.set(userId, {
      id: userId,
      name: userName,
      ws,
      state: userId === this.ownerId ? "ready" : "idle",
    });
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

  public transToClientData(): any {
    const playerList = this.playerList
      .filter(({ ws }) => ws?.readyState === WebSocket.OPEN)
      .map(({ ws, ...other }) => ({
        ...other,
      }));
    const data = {
      ...pick(this, ["id", "name", "ownerId"]),
      playerList,
    };

    return data;
  }

  // 校验所有用户的 websocket 是否为关闭状态
  isAllUserWSClosed() {
    console.log(
      "this.playerList",
      this.playerList.map(({ ws }) => ws?.readyState)
    );
    return this.playerList.every(
      ({ ws }) => ws?.readyState === WebSocket.CLOSED
    );
  }
}
