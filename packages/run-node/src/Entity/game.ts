import { type } from "os";
import { WebSocket } from "ws";

export interface IPlayer {
  id: string;
  name?: string;
  ws?: WebSocket;
  state?: "ready" | "idle";
}

export interface IMessage {
  action: string;
  payload: any;
  timestamp: number;
}

export class Game {
  currentStateData = null;
  playerList: IPlayer[] = [];
  ownerId: string = "";
  id: string = "";
  messageQueue: IMessage[] = [];
  state: "uninit" | "playing" | "over" = "uninit";

  constructor({
    ownerId,
    gameId,
    playerList,
  }: {
    ownerId: string;
    gameId: string;
    playerList: IPlayer[];
  }) {
    this.ownerId = ownerId;
    this.id = gameId;
    this.playerList = playerList;
  }

  public pushMessage(message: IMessage) {
    this.messageQueue.push(message);
  }
}
