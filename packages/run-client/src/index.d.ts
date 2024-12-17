declare interface IRoom {
  id: string;
  name: string;
  ownerId: string;
  playerList: {
    id: string;
    name: string;
    status: "ready" | "idle";
  }[];
}

declare interface IPlayer {
  id: string;
  name: string;
}

interface ITurnLotteryCard {
  color: "red" | "blue" | "green" | "yellow" | "purple";
  value: number;
  ownerId: string;
}

declare type HorseColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "white"
  | "black";

declare type NormalHorseColor = "red" | "blue" | "green" | "yellow" | "purple";

declare type FinalCardType = "win" | "lose";

declare interface IFinalCard {
  color: NormalHorseColor;
  type: FinalCardType;
  owner?: string;
}
