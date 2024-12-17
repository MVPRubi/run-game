import { BoardEffect } from "./Horse";
import { NORMAL_COLOR_LIST } from "@constant";

export class GamePlayer {
  id: string = "";
  effects: BoardEffect[] = [];
  coins: number = 0;
  finalCards: IFinalCard[] = [];

  constructor({ id }: { id: string }) {
    this.id = id;

    this.initEffect();

    this.initFinalCards();
  }

  initFinalCards() {
    this.finalCards = [];
    NORMAL_COLOR_LIST.forEach((color) => {
      this.finalCards.push({
        color,
        type: "win",
      });
      this.finalCards.push({
        color,
        type: "lose",
      });
    });
  }

  initEffect() {
    this.effects = [
      new BoardEffect({
        type: "advance",
        ownerId: this.id,
      }),
      new BoardEffect({
        type: "back",
        ownerId: this.id,
      }),
    ];
  }

  clearEffect() {
    this.effects = [];
  }

  addCoin(count: number) {
    this.coins += count;
  }
}
