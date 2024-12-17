import {
  Mesh,
  Vector3,
  CatmullRomCurve3,
  Clock,
  Vector2,
  BoxGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  Plane,
  TextureLoader,
} from "three";
import { GameEventEmitter } from "../Event";
import { Game, isBottomHorse } from "./Game";
import { getBottomHorse, isBlackorWhite } from "@utils";
import gsap from "gsap";
import { hasAnimation } from "../Manager/AnimManager";

import arrowImg from "@assets/Icon/arrow.png";
import advanceIcon from "@assets/Icon/advance.png";
import backIcon from "@assets/Icon/back.png";
import advanceTransIcon from "@assets/Icon/advance-t.png";
import backTransIcon from "@assets/Icon/back-t.png";

import shortid from "short-uuid";

interface IPosition {
  x: number;
  y: number;
  z: number;
}

type HorseState = "idle" | "running" | "end";

const duration = 0.5;

export class Horse {
  id: string = "";
  position: Vector3;
  targetPosition: Vector3;
  upper: Horse | null = null;
  under: Horse | null = null;
  color: string = "red";
  state: HorseState = "idle";
  mesh: Mesh | null = null;
  boardIndex: number = 0;
  order?: number;
  isHorseMoving: boolean = false;
  isPassing: boolean = false;
  curve?: CatmullRomCurve3 | null = null;
  clock?: Clock | null = null;
  effect: BoardEffect | null = null;

  constructor({
    id = "",
    position = new Vector3(0, 0, 0),
    upper = null,
    under = null,
    color = "red",
    boardIndex = 0,
    order,
  }: {
    id?: string;
    position?: Vector3 | IPosition;
    upper?: Horse | null;
    under?: Horse | null;
    color?: string;
    boardIndex?: number;
    order?: number;
  } = {}) {
    this.id = id || shortid.generate();
    if (!(position instanceof Vector3)) {
      this.position = new Vector3(position.x, position.y, position.z);
    } else {
      this.position = position;
    }
    this.upper = upper;
    this.under = under;
    this.color = color;
    this.boardIndex = boardIndex;
    if (order !== undefined) {
      this.order = order;
    }
  }

  setPosition(position: Vector3) {
    if (this.mesh) {
      this.mesh.position.set(position.x, position.y, position.z);
    }
    // this.targetPosition = position;
  }

  // 获取在under和upper之间的顺序
  // 最下面为0
  getPosYOrder() {
    let order = 0;
    let under = this.under;
    while (under) {
      order++;
      under = under.under;
    }
    return order;
  }

  move(distance: number, isPassing: boolean = false) {}

  moveByCurve({
    path,
    isPassing = false,
    // isReverse = false,
    effect = null,
    boardIndex = 0,
    immediate = false,
    cb = () => {},
  }: {
    path: CatmullRomCurve3;
    isPassing?: boolean;
    isReverse?: boolean;
    effect?: BoardEffect | null;
    boardIndex?: number;
    immediate?: boolean;
    cb?: () => void;
  }) {
    this.isHorseMoving = true;
    this.effect = effect;
    this.boardIndex = boardIndex;
    if (this.under && !isPassing) {
      this.under.upper = null;
      this.under = null;
    }

    this.updatePositionY();

    const calcFromUnitVectors = (progress: number) => {
      const point = path.getPointAt(progress);
      const tangent = path.getTangentAt(progress);
      this.mesh.position.x = point.x;
      this.mesh.position.z = point.z;
      const bottomHorse = getBottomHorse(this);
      let isNotReverse = 1;

      if (effect?.type === "back") {
        return;
      }

      if (isBlackorWhite(bottomHorse.color) && !isBlackorWhite(this.color)) {
        isNotReverse = -1;
      } else if (
        !isBlackorWhite(bottomHorse.color) &&
        isBlackorWhite(this.color)
      ) {
        isNotReverse = -1;
      }

      this.mesh.quaternion.setFromUnitVectors(
        new Vector3(1 * isNotReverse, 0, 0),
        tangent.clone().normalize()
      );
    };

    if (hasAnimation()) {
      const tween = gsap.to(this.mesh, {
        duration,
        ease: "linear",
        onUpdate: () => {
          const progress = tween.progress();
          calcFromUnitVectors(progress);
        },
        onComplete: () => {
          // this.curve = null;
          this.isHorseMoving = false;
          // this.updatePositionY();
          // setTimeout(() => {
          GameEventEmitter.emit("horseMoveEnd", { horse: this, cb });
          // });
        },
      });
    } else {
      calcFromUnitVectors(1.0);
      this.isHorseMoving = false;
      GameEventEmitter.emit("horseMoveEnd", { horse: this, cb });
    }

    let upper = this.upper;
    while (upper && !isPassing) {
      upper.moveByCurve({
        path,
        isPassing: true,
        boardIndex,
        immediate,
        effect,
      });
      upper = upper.upper;
    }
  }

  updatePositionY() {
    // console.log("updatePositionY", this.getPosYOrder(), this);
    const nextPosY = 0.5 * this.getPosYOrder();
    gsap.to(this.mesh?.position, {
      y: nextPosY,
      duration: 0.2,
    });
    // this.mesh?.position.setY(0.5 * this.getOrder());
  }

  update(time) {}
}

export class Board {
  id: string = "";
  position: Vector3;
  type: string = "normal";
  mesh: Mesh | null = null;
  effect: BoardEffect | null = null;
  index: number = 0;
  effectMesh: Mesh | null = null;

  constructor({
    id = "",
    position = new Vector3(0, 0, 0),
    type = "normal",
    index = 0,
  }: {
    id?: string;
    position?: Vector3 | IPosition;
    type?: string;
    index?: number;
  } = {}) {
    this.id = id || shortid.generate();
    if (!(position instanceof Vector3)) {
      this.position = new Vector3(position.x, position.y, position.z);
    } else {
      this.position = position;
    }
    this.type = type;
    this.index = index;
  }

  addEffect(effect: BoardEffect) {
    this.effect = effect;
  }

  clearEffect() {
    this.effect = null;
  }

  renderEffect(boardCount: number) {
    if (this.effect) {
      const geometry = new PlaneGeometry();
      const texture = new TextureLoader().load(
        this.effect.type === "advance" ? advanceTransIcon : backTransIcon
      );
      const material = new MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      const cube = new Mesh(geometry, material);
      cube.scale.set(0, 0, 0);
      cube.position.set(this.position.x, 0.02, this.position.z);
      cube.rotation.x = -Math.PI / 2;
      cube.rotation.z = -Math.PI / 2;

      const index = this.index;
      // 赛段数的1/4
      const section = boardCount / 4;
      if (index > 0 && index <= section) {
        cube.rotation.z = 0;
      } else if (index > section && index <= section * 2) {
        cube.rotation.z = -Math.PI / 2;
      } else if (index > section * 2 && index <= section * 3) {
        cube.rotation.z = -Math.PI;
      } else {
        cube.rotation.z = +Math.PI / 2;
      }
      if (this.effect.type === "advance") {
        cube.rotation.z += Math.PI;
      } else {
        cube.rotation.z -= Math.PI;
      }
      this.effectMesh = cube;
      // bounce 出场动画, 然后前后循环移动
      const tl = gsap.timeline();
      tl.to(cube.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.2,
        yoyo: true,
      }).to(cube.position, {
        y: 0.1,
        duration: 1,
        yoyo: true,
        ease: "power1.inOut",
        repeat: -1,
      });

      return cube;
    }
    return null;
  }
}

type BoardEffectType = "advance" | "back";

const typeIconMap = {
  advance: advanceTransIcon,
  back: backTransIcon,
};

export class BoardEffect {
  type: BoardEffectType = "advance";
  ownerId: string = "";
  value: number = 1;
  board: Board | null = null;
  icon: string = "";
  constructor({
    type = "advance",
    ownerId = "",
    value = 1,
    board = null,
  }: {
    type?: "advance" | "back";
    ownerId?: string;
    value?: number;
    board?: Board;
  } = {}) {
    this.type = type;
    this.ownerId = ownerId;
    this.value = value;
    this.board = board;
    this.icon = typeIconMap[type];
  }

  takeEffect(trigger: Horse, game: Game, cb: () => void) {
    if (!isBottomHorse(trigger)) {
      return;
    }
    game.turn.addCoinToPlayer(this.ownerId, 1);
    const isNotReverse = isBlackorWhite(trigger.color) ? -1 : 1;
    // 找到当前 board 的下一个 board
    const boardList = game.boardList;
    const index = boardList.findIndex((board) => board.id === this.board?.id);
    const isBack = this.type === "back";
    const nextBoardIndex = index + (isBack ? -1 : 1) * isNotReverse;
    const nextBoard = boardList[nextBoardIndex];
    if (!nextBoard) {
      return;
    }
    const moveCurv = new CatmullRomCurve3([
      new Vector3(trigger.mesh.position.x, 0, trigger.mesh.position.z),
      new Vector3(nextBoard.position.x, 0, nextBoard.position.z),
    ]);
    trigger.moveByCurve({
      path: moveCurv,
      isReverse: isBack,
      effect: this,
      boardIndex: nextBoardIndex,
      cb,
    });
  }
}
