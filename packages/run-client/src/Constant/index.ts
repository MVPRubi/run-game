import playerImg1 from "@assets/Image/player-head1.png";
import playerImg2 from "@assets/Image/player-head2.png";
import playerImg3 from "@assets/Image/player-head3.png";
import playerImg4 from "@assets/Image/player-head4.png";

type HorseColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "white"
  | "black";

export const DEFAULT_HOUSE_COLOR: HorseColor[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "white",
  "black",
];

export const NORMAL_COLOR_LIST: NormalHorseColor[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
];

export const DEFAULT_DICE_COLOR = "#807C7C";

export const playerColorList = ["#5B60FD", "#FF565E ", "#43DFA8", "#2BD9F5"];

export const BOARD_HEIGHT_OFFSET = 0.01;

export const playerImgList = [playerImg1, playerImg2, playerImg3, playerImg4];
