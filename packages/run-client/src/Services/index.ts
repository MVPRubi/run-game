import { connectSocket } from "./socket";
import axios from "axios";

// const BASE_HOST = "192.168.199.141:8899";
// const BASE_HOST = "123.206.117.14:8899";
const BASE_HOST = "api.vcyberlift.com";
// const SOCKET_BASE_HOST = "192.168.199.141:8898";
// const SOCKET_BASE_HOST = "123.206.117.14:8898";
const SOCKET_BASE_HOST = "vcyberlift.com:8898";

axios.defaults.baseURL = `http://${BASE_HOST}`;
axios.defaults.headers.common = {
  "Content-Type": "application/json",
  accept: "application/json",
};

export * from "./socket";

export const connect = async (protocol: string): Promise<WebSocket> => {
  return connectSocket.connect(`ws://${SOCKET_BASE_HOST}`, protocol);
};

export const close = async () => {
  connectSocket.close();
};

export const createRoom = (params: { userId: string; userName: string }) => {
  return axios.post("api/room/create", params);
};

export const getRoomList = () => {
  return axios.get("api/room/list");
};

export const enterRoom = (params: { roomId: string; userId: string }) => {
  return axios.post("api/room/enter", params);
};

export const createGame = (params: { room: any }) => {
  return axios.post("api/game/create", params);
};
