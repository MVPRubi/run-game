import { Horse } from "src/Entity/Horse";

type HorseColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "white"
  | "black";

type DiceType = "red" | "blue" | "green" | "yellow" | "purple" | "custom";

declare interface DiceResult {
  type: DiceType;
  color: HorseColor;
  value: number;
}

declare interface Effect {
  type: string;
  ownerId: string;
}

interface IBoardEffect {
  type: "advance" | "back";
  ownerId: string;
  value: number;
  takeEffect: (trigger: Horse) => void;
}

declare type NormalHorseColor = "red" | "blue" | "green" | "yellow" | "purple";

declare interface ICard {
  color: NormalHorseColor;
  value: number;
  owner: string;
}

declare interface IPlayer {
  id: string;
  name: string;
}

declare interface IFinalCard {
  color: NormalHorseColor;
  owner?: string;
}
