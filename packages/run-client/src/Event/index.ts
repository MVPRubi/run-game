import { EventEmitter } from "eventemitter3";

export const GameEventEmitter = new EventEmitter();

export interface IAddCoinMessage {
  playerId: string;
  coin: number;
}

export interface IAddCardMessage {
  playerId: string;
  card: ITurnLotteryCard;
}

export enum EventType {
  addCoin = "addCoin",
  addCard = "addCard",
}
