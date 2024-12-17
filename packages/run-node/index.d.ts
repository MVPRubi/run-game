declare interface IPlayer {
  id: string;
  name: string;
  ws: WebSocket;
  state: "ready" | "idle";
}
