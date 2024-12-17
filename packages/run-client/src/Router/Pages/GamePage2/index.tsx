import { useEffect, useRef, useState, useMemo } from "react";
import { flushSync } from "react-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Button, message } from "antd";
import { connect, close } from "@services";
import { tryGetUserId, rollDiceResult, tryGetUser } from "@utils";
import CircularJSON from "circular-json";
import { Dice, DiceBtn, Loading } from "@components";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useParams } from "react-router-dom";
import { getMapColor } from "@utils";
import gsap from "gsap";
import { CSSRulePlugin } from "gsap/CSSRulePlugin";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";

import { Game } from "../../../Entity/Game";
import { Board, Horse, BoardEffect } from "../../../Entity/Horse";
import UserPortal from "./UserPortal";
import CardSelectModal from "./CardSelectModal";
import PlayerSelectModal from "./PlayerSelectModal";
import DiceResPanel from "./DiceResPanel";
import Card from "../../../Components/Card";
import CardSelectBtn from "./CardSelectBtn";
import GameOverModal from "./GameOverModal";
import Hint from "./Hint";
import ItemsPanel from "./ItemsPanel";
import { renderWater } from "./Scene";
import { load, IAssets, release } from "../../../Manager/AssetsManager";
import { pauseAnimation, resumeAnimation } from "../../../Manager/AnimManager";
import MenuModal, { MenuActionType } from "./MenuModal";
import ActionBtnGroup, { ActionType } from "./ActionBtnGroup";
import HelpModal from "./HelpModal";
import FinalCardModal from "./FinalCardModal";

import scene2 from "@assets/Model/scene2-3.glb";
import horse4 from "@assets/Model/horse4.glb";
import jiangbei from "@assets/Model/jiangbei.glb";
import roadImg from "@assets/Icon/road2.png";
import roadSvg from "@assets/Icon/road.svg";

import styles from "./index.module.less";
import { set } from "lodash-es";

gsap.registerPlugin(CSSRulePlugin);

function Game2() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const divRef = useRef();
  const gameRef = useRef<Game | null>(null);
  if (gameRef.current === null) {
    gameRef.current = new Game(gameId);
  }
  const socketRef = useRef<WebSocket | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  if (rendererRef.current === null) {
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
  }
  const renderer = rendererRef.current;

  const diceRef = useRef(null);
  // const modelRef = useRef(null);
  const diceResTextMeshRef = useRef<any[]>([]);
  const diceResPanelRef = useRef<any>(null);
  const hintRef = useRef<any>(null);
  const itemsPanelRef = useRef<any>(null);
  const isItemDrag = useRef(false);
  const prePointerSelected = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const originBoardEmissive = useRef(null);
  const cameraControlRef = useRef<OrbitControls | null>(null);
  const waterRef = useRef(null);
  const assetsRef = useRef<IAssets>({});
  const isReconnectRef = useRef(false);
  // const raycaster = new THREE.Raycaster();
  // const mouse = new THREE.Vector2();

  const [cardSelectVisible, setCardSelectVisible] = useState(false);
  const [gameOverVisible, setGameOverVisible] = useState(false);
  const [playerInfoVisible, setPlayerInfoVisible] = useState(false);
  const [diceBtnVisible, setDiceBtnVisible] = useState(true);
  const [memuVisible, setMemuVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<IPlayer | undefined>();
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [winFinalCardVisible, setWinFinalCardVisible] = useState(false);
  const [loseFinalCardVisible, setLoseFinalCardVisible] = useState(false);

  const [, setForceUpdate] = useState({});
  const forceUpdate = () => flushSync(() => setForceUpdate({}));
  const effectMeshList = useRef<THREE.Mesh[]>([]);

  const operateEnable =
    gameRef.current?.currentStagePlayerId === tryGetUserId();

  const sceneWidth = useMemo(() => {
    return window.innerWidth > 500 ? 414 : window.innerWidth;
  }, []);
  const sceneHeight = useMemo(() => {
    const rootDom = document.getElementById("root") as HTMLElement;
    return rootDom?.clientHeight || window.innerHeight;
  }, []);

  const connectGameSocket = async () => {
    const socket = await connect("game2");
    if (socket) {
      socket.addEventListener("message", handleMessage);

      socketRef.current = socket;
    }
    console.log("connectGameSocket", socket);
    socket.send(
      JSON.stringify({
        type: "create",
        payload: {
          gameId: gameRef.current?.id,
          userId: tryGetUserId(),
        },
      })
    );
  };

  const messageReducer = ({
    payload,
    action,
  }: {
    payload: any;
    action: string;
  }) => {
    const gameInst = gameRef.current as Game;
    if (!gameInst) {
      return;
    }
    const reducer: Record<string, Function> = {
      create: () => {
        const { ownerId, state } = payload;
        if (state === "playing") {
          socketRef.current?.send(
            CircularJSON.stringify({
              type: "reconnect",
              payload: {
                gameId: gameInst.id,
                sourceId: tryGetUserId(),
              },
            })
          );
          return;
        }
        if (ownerId === tryGetUserId()) {
          gameInst.init();

          socketRef.current?.send(
            CircularJSON.stringify({
              type: "init",
              payload: {
                gameId: gameInst.id,
                sourceId: tryGetUserId(),
                game: {
                  ...gameInst,
                  horseList: Array.from(gameInst.horseMap.values()).map(
                    (horse) => {
                      const { under, upper, ...other } = horse;
                      return { ...other, order: horse.getPosYOrder() };
                    }
                  ),
                },
              },
            })
          );
        }
      },
      init: () => {
        const { game } = payload;
        gameInst.initWithGame(game);
        renderGame();
        if (!isReconnectRef.current) {
          setIsLoading(false);
          cameraZoomIn();
        }
        // forceUpdate();
      },
      dice: () => {
        const { diceRes, sourceId } = payload;
        const { color, value } = diceRes;
        gameInst.turn.addCoinToPlayer(sourceId, 1);
        gameInst.handleDice(diceRes);
        diceRef.current?.showDiceResult({
          diceResult: {
            color,
            value,
          },
          onAnimStart: () => {
            setDiceBtnVisible(false);
          },
          onAnimEnd: () => {
            setDiceBtnVisible(true);
            diceResPanelRef.current?.update();
            const horse = gameInst.horseMap.get(color);
            const boardIndex = horse.boardIndex;
            const boardList = gameInst.boardList;
            const isReverse = color === "black" || color === "white";
            // 根据 value 和 boardIndex 创建即将移动的 CatmullRomCurve3 曲线
            // 如果是黑或者白，反向移动
            let path;
            let nextBoardIndex;
            if (!isReverse) {
              nextBoardIndex = boardIndex + value;
              path = (boardList || [])
                .slice(boardIndex, nextBoardIndex + 1)
                .map((board) => board.position);
            } else {
              nextBoardIndex = boardIndex - value;
              // 从 boardIndex 到 nextBoardIndex 之间的 boardList 是反向的
              path = (boardList || [])
                .slice(nextBoardIndex, boardIndex + 1)
                .map((board) => board.position)
                .reverse();
            }

            console.log("nextBoardIndex", nextBoardIndex);

            if (nextBoardIndex >= gameInst.boardList.length - 1) {
              gameInst.settlementPlayerCoin();
              setGameOverVisible(true);
            }

            const curv = new THREE.CatmullRomCurve3(path);
            gameInst.takeTurnStagePlayer();
            const isTurnEnd = gameInst.diceResultList.length === 5;
            // if (isTurnEnd) {
            // }
            horse?.moveByCurve({
              path: curv,
              isReverse,
              boardIndex: nextBoardIndex,
              cb: () => {
                // 处理回合结束
                if (isTurnEnd) {
                  gameInst.nextTurn();
                  console.log("回合结束");
                  gameInst.clearDiceResult();
                  hintRef.current.show(
                    <div>{"回合结束\n重置骰子、卡片、道具中..."}</div>
                  );
                  effectMeshList.current.forEach((mesh) => {
                    sceneRef.current?.remove(mesh);
                  });
                  effectMeshList.current = [];
                }
                forceUpdate();
                // 移除
                diceResPanelRef.current?.update();
              },
            });
          },
        });
        forceUpdate();
      },
      addBoardEffect: () => {
        const { boardIndex, effect, sourceId } = payload;
        gameInst.takeTurnStagePlayer();
        const currentBoard = gameInst.boardList[boardIndex];
        if (!currentBoard) {
          return;
        }
        const mesh = gameInst.handleAddEffectToBoard({
          board: currentBoard,
          effect,
          playerId: sourceId,
        });

        sceneRef.current?.add(mesh);
        effectMeshList.current = [...effectMeshList.current, mesh];
        forceUpdate();
      },
      choiceCard: () => {
        const { color: color2, sourceId: sourceId2 } = payload;
        gameInst.takeTurnStagePlayer();
        gameInst.turn.addCardToPlayer(sourceId2, color2);

        forceUpdate();
      },
      reconnect: () => {
        isReconnectRef.current = true;
        setIsLoading(true);
        pauseAnimation();
        const [create, ...other] = payload;
        messageReducer(create);
        setTimeout(() => {
          other.forEach((data: any) => {
            messageReducer(data);
          });

          setTimeout(() => {
            resumeAnimation();
            diceResPanelRef.current?.update();
            setIsLoading(false);
            isReconnectRef.current = false;
            cameraZoomIn();
          }, 100);
        }, 1000);
      },
      addFinalCard: () => {
        const { color, sourceId } = payload;
        gameInst.takeTurnStagePlayer();
        gameInst.addFinalCard(sourceId, color);
      },
    };

    return reducer[action]?.();
  };

  const handleMessage = (event: MessageEvent) => {
    const gameInst = gameRef.current as Game;
    if (!gameInst) {
      return;
    }
    const data = JSON.parse(event.data);
    console.log("handleMessage game", data);

    messageReducer(data);
  };

  const renderScene = () => {
    const { scene, trophy } = assetsRef.current;
    if (scene) {
      const model = scene.scene;
      const water = model.getObjectByName("SHUIMIAN");
      // 添加水面 material
      const waterMaterial = new THREE.MeshToonMaterial({
        color: "#0000ff",
      });

      sceneRef.current?.add(model);

      waterRef.current = renderWater({
        light: sceneRef.current?.children.find(
          (child) => child.name === "light"
        ) as THREE.Light,
        camera: cameraRef.current as THREE.Camera,
      });
      waterRef.current.mesh.position.set(8, -5.5, 8);
      sceneRef.current?.add(waterRef.current.mesh);
      // 找到lanzi对象，并且添加上下浮动循环动画
      // 以自身为中心，y轴上下浮动0.2
      const lanzi = model.getObjectByName("lanzi");
      if (lanzi) {
        gsap.to(lanzi.position, {
          y: lanzi.position.y + 0.3,
          duration: 3,
          yoyo: true,
          repeat: -1,
        });
      }
      const chuan = model.getObjectByName("chuan");
      if (chuan) {
        // 给船添加一个在水面上自由摇曳的动画
        gsap.to(chuan.rotation, {
          z: (Math.PI / 180) * 2,
          duration: 1,
          yoyo: true,
          repeat: -1,
        });
      }
    }
    if (trophy) {
      (() => {
        const model = trophy.scene;
        model.scale.set(0.15, 0.15, 0.15);
        const { boardList = [] } = gameRef.current;
        const pos = boardList[boardList.length - 1].position;
        model.position.set(pos.x, pos.y + 0.2, pos.z);
        // 微微倾斜
        model.rotation.z = -Math.PI / 6;
        model.rotation.y = Math.PI / 6;

        // 给模型名为 柱体011 物体添加半透明的金色的自发光
        model.traverse((child) => {
          if (child.name === "柱体011") {
            const material = new THREE.MeshToonMaterial({
              color: "#feff39",
            });
            child.material = material;
          }
        });

        // 不断上下移动和旋转
        gsap.to(model.position, {
          y: pos.y + 0.3,
          duration: 1,
          yoyo: true,
          repeat: -1,
        });

        sceneRef.current?.add(model);
      })();
    }
  };

  const renderPlane = () => {
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshToonMaterial({
      color: "#21e544",
      emissive: "#21e544",
    });
    const mesh = new THREE.Mesh(geometry, material);
    // 沿着 x 转 90 度
    // mesh.rotation.x = -Math.PI / 2;
    return mesh;
  };

  const renderBoard = (board: Board, color?: string) => {
    const geometry = new THREE.PlaneGeometry();
    let mcolor = color || "#f99a18";
    if (board.effect) {
      mcolor = "#f00";
    }
    const texture = new THREE.TextureLoader().load(roadSvg);
    const material = new THREE.MeshToonMaterial({
      map: texture,
      color: 0xffffff,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(board.position.x, board.position.y, board.position.z);
    mesh.rotation.x = Math.PI / -2;
    mesh.__gameObj = board;
    board.mesh = mesh;
    return mesh;
  };

  const renderHorse = (horse: Horse) => {
    const { horse: horseModel } = assetsRef.current;

    // 加载模型
    const loader = new GLTFLoader();
    loader.load(horse4, (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5);
      model.position.set(horse.position.x, 0, horse.position.z);
      const { color } = horse;
      // 如果是黑色和白色旋转 90 度，其他颜色旋转 180 度
      if (color === "black" || color === "white") {
        model.rotation.y = Math.PI / 2;
      } else {
        model.rotation.y = Math.PI;
      }
      // 添加color材质
      const material = new THREE.MeshToonMaterial({
        color: getMapColor(color),
      });
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });

      horse.mesh = model;
      horse.updatePositionY();
      sceneRef.current?.add(model);
    });
  };

  const cameraZoomIn = () => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }
    camera.position.set(7, 4.5, 6.8);
    // 展示一个cameraZoomIn的动画
    gsap.to(camera.position, {
      x: 12.4,
      y: 8.37,
      z: 12.69,
      duration: 1,
    });
  };

  const resetCamera = () => {
    // cameraControlRef.current?.reset();
    // 用 gasp 将摄像机的位置和旋转重置
    gsap.to(cameraRef.current?.position, {
      x: 12.4,
      y: 8.37,
      z: 12.69,
      duration: 0.3,
    });
    gsap.to(cameraRef.current?.rotation, {
      x: (-33.41 * Math.PI) / 180,
      y: (39 * Math.PI) / 180,
      z: (22.6 * Math.PI) / 180,
      duration: 0.3,
    });
  };

  const renderGame = () => {
    const game = gameRef.current;
    if (!game) {
      return;
    }

    // -----------------camera-----------------
    const camera = new THREE.PerspectiveCamera(
      55,
      sceneWidth / sceneHeight,
      0.01,
      100000
    );
    cameraRef.current = camera;
    camera.position.set(12.4, 8.37, 12.69);
    camera.rotation.set(
      (-33.41 * Math.PI) / 180,
      (39 * Math.PI) / 180,
      (22.6 * Math.PI) / 180
    );

    // -----------------scene-----------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#b4e2fc");
    scene.fog = new THREE.FogExp2(0xaaccff, 0.01);
    sceneRef.current = scene;

    // -----------------light-----------------
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    light.intensity = 2;
    light.name = "light";
    scene.add(light);

    renderScene();

    // -----------------board-----------------
    game.boardList.forEach((board, index) => {
      let color = "#ffb44f";
      if (index === 0) {
        color = "#fff";
      }
      if (index === game.boardList.length - 1) {
        color = "#f00";
      }
      const mesh = renderBoard(board, color);
      scene.add(mesh);
    });

    // -----------------horse-----------------
    Array.from(game.horseMap.values()).forEach((horse) => {
      renderHorse(horse);
    });

    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(sceneWidth, sceneHeight);
    renderer.setAnimationLoop(animation);
    document.getElementById("scene")?.replaceChildren(renderer.domElement);

    const renderPass = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0.8;
    bloomPass.strength = 0.3;
    bloomPass.radius = 0.1;
    const afterimagePass = new AfterimagePass();

    const outputPass = new OutputPass();
    const mSSAOPass = new SSAOPass(
      scene,
      camera,
      window.innerWidth,
      window.innerHeight
    );
    mSSAOPass.kernelRadius = 16;
    const filmPass = new FilmPass(0.2);
    const outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );

    // composer.addPass(renderPass);
    // composer.addPass(outlinePass);
    // composer.addPass(filmPass);
    // composer.addPass(mSSAOPass);
    // composer.addPass(afterimagePass);
    // composer.addPass(bloomPass);
    // composer.addPass(outputPass);

    const controls = new OrbitControls(camera, renderer.domElement);
    cameraControlRef.current = controls;
    // controls.target.set(0, 0, 0);
    controls.minDistance = 3;
    controls.maxDistance = 22;
    controls.minPolarAngle = Math.PI / 4.5;
    controls.maxPolarAngle = Math.PI / 2.5;
    //  Y 轴最低高度为 5，最高为 20
    controls.minAzimuthAngle = 0;
    controls.maxAzimuthAngle = Math.PI / 2;
    controls.saveState();

    // -----------------animation-----------------
    function animation(time) {
      waterRef.current?.update(time);
      // 递归调用 Horse 的 update 方法
      Array.from(game.horseMap.values()).forEach((horse) => {
        horse.update.call(horse, time);
      });
      // composer.render();
      renderer.render(scene, camera);
    }
  };

  // 鼠标移动事件
  useEffect(() => {
    raycasterRef.current = new THREE.Raycaster();
    mouseRef.current = new THREE.Vector2();

    // 定义一个回调函数，当用户点击鼠标时执行
    function onMouseMove(event: MouseEvent) {
      // 判断当前是否点击的 canvas
      // if (event.target !== renderer.domElement) {
      //   return;
      // }
      const sceneX = divRef.current?.getBoundingClientRect().left || 0;
      const sceneY = divRef.current?.getBoundingClientRect().top || 0;

      if (!isItemDrag.current) {
        return;
      }
      // 计算鼠标的归一化坐标
      mouseRef.current.x = ((event.clientX - sceneX) / sceneWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - sceneY) / sceneHeight) * 2 + 1;
      handleRaycasterMove();
    }

    // 当鼠标松开判断当前选中的物体是否为Board，如果是则添加效果
    function onMouseUp(event: MouseEvent) {
      // 判断当前是否点击的 canvas
      // if (event.target !== renderer.domElement) {
      //   return;
      // }

      // mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      // mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      handleRaycasterUp();
    }

    function onTouchMove(event: TouchEvent) {
      // 判断当前是否点击的 canvas
      // if (event.target !== renderer.domElement) {
      //   return;
      // }
      if (!isItemDrag.current) {
        return;
      }
      const sceneX = divRef.current?.getBoundingClientRect().left || 0;
      const sceneY = divRef.current?.getBoundingClientRect().top || 0;
      mouseRef.current.x =
        ((event.touches[0].clientX - sceneX) / sceneWidth) * 2 - 1;
      mouseRef.current.y =
        -((event.touches[0].clientY - sceneY) / sceneHeight) * 2 + 1;
      handleRaycasterMove();
    }

    function onTouchEnd(event: TouchEvent) {
      // 判断当前是否点击的 canvas
      // if (event.target !== renderer.domElement) {
      //   return;
      // }
      handleRaycasterUp();
    }
    const timer = setTimeout(() => {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);

      // 手机端
      window.addEventListener("touchstart", onTouchMove);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      // 手机端
      window.removeEventListener("touchstart", onTouchMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // 加载资源
  useEffect(() => {
    const loadAssets = async () => {
      assetsRef.current = await load();

      // 创建连接,并且初始化游戏
      setIsAssetsLoaded(true);
      connectGameSocket();
    };

    loadAssets();

    return () => {
      release();
      close();
    };
  }, []);

  useEffect(() => {
    gameRef.current?.addSelfEventListener();

    return () => {
      gameRef.current?.removeSelfEventListener();
      socketRef.current?.removeEventListener("message", handleMessage);

      gameRef.current = null;
      socketRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  const handleFinalCardClick = (finalCardType: FinalCardType) => {
    if (finalCardType === "win") {
      setWinFinalCardVisible(true);
    } else {
      setLoseFinalCardVisible(true);
    }
  };

  const handleRaycasterMove = () => {
    const raycaster = raycasterRef.current;
    const mouse = mouseRef.current;
    const prevSelected = prePointerSelected.current;
    // 计算射线的方向和起点
    raycaster.setFromCamera(mouse, cameraRef.current);
    // 计算射线和场景中的物体的相交情况
    const intersects = raycaster.intersectObjects(sceneRef.current.children);
    //颜色变亮之后又变回去
    const first = intersects[0]?.object as THREE.Mesh;

    if (!gameRef.current?.boardList?.map(({ mesh }) => mesh).includes(first)) {
      if (prevSelected) {
        gsap.to(prevSelected.material.emissive, {
          r: 0,
          g: 0,
          b: 0,
          duration: 0.5,
        });
        prePointerSelected.current = null;
      }
      return;
    }

    if (!gameRef.current?.detectCanAddEffectToBoard(first.__gameObj)) {
      return;
    }

    if (first !== prevSelected && prevSelected) {
      // 移除 emissive
      // prevSelected.material.emissive.set("#f99a18");
      gsap.to(prevSelected.material.emissive, {
        r: 0,
        g: 0,
        b: 0,
        duration: 0.5,
      });
      prePointerSelected.current = null;
    }
    // 通过添选中的物体发蓝光, 不选中时移除
    if (first) {
      gsap.to(first.material.emissive, {
        r: 0,
        g: 1,
        b: 1,
        duration: 0.5,
      });

      // first.material.emissive.set("#00ff00");
      prePointerSelected.current = first;
    }
  };

  const handleRaycasterUp = () => {
    const prevSelected = prePointerSelected.current;
    const raycaster = raycasterRef.current;
    const mouse = mouseRef.current;
    // 计算射线的方向和起点
    raycaster.setFromCamera(mouse, cameraRef?.current);
    // 计算射线和场景中的物体的相交情况
    const intersects = raycaster.intersectObjects(sceneRef.current?.children);
    const first = intersects[0]?.object as THREE.Mesh;
    //判断是否为lanzi对象
    if (first?.name === "lanzi" || first?.name === "chuan") {
      // 物体变蓝，过一秒后变回去
      gsap.to(first.material.color, {
        r: 0.6,
        g: 1,
        b: 1,
        duration: 0.1,
      });
      setTimeout(() => {
        gsap.to(first.material.color, {
          r: 1,
          g: 1,
          b: 1,
          duration: 0.1,
        });
      }, 200);
      if (first.name === "lanzi") {
        handleFinalCardClick("win");
      }
      if (first.name === "chuan") {
        handleFinalCardClick("lose");
      }
      return;
    }

    //颜色变亮之后又变回去
    if (prevSelected) {
      gsap.to(prevSelected.material.emissive, {
        r: 0,
        g: 0,
        b: 0,
        duration: 0.5,
      });

      prePointerSelected.current = null;
    }
    
    if (!isItemDrag.current) {
      return;
    }

    if (!gameRef.current?.boardList?.map(({ mesh }) => mesh).includes(first))
      return;

    if (!gameRef.current?.detectCanAddEffectToBoard(first.__gameObj)) {
      return;
    }

    if (first) {
      socketRef.current?.send(
        JSON.stringify({
          type: "addBoardEffect",
          payload: {
            gameId: gameRef.current?.id,
            sourceId: tryGetUserId(),
            boardIndex: gameRef.current?.boardList.findIndex(
              (board) => board.mesh === first
            ),
            effect: itemsPanelRef.current?.getCurrentDragEffect(),
          },
        })
      );
    }
  };

  const handleDice = () => {
    if (gameRef.current?.isHorseMoving()) {
      return;
    }

    const diceRes = rollDiceResult(gameRef.current?.remindDiceType);

    socketRef.current?.send(
      JSON.stringify({
        type: "dice",
        payload: {
          gameId: gameRef.current?.id,
          sourceId: tryGetUserId(),
          diceRes: diceRes,
        },
      })
    );
  };

  const handleCardSelect = (card) => {
    const { color } = card;
    socketRef.current?.send(
      JSON.stringify({
        type: "choiceCard",
        payload: {
          gameId: gameRef.current?.id,
          sourceId: tryGetUserId(),
          color: color,
        },
      })
    );
  };

  const handleActionBtnClick = (action: ActionType) => {
    if (action === "setting") {
      setMemuVisible(true);
    }
    if (action === "help") {
      setHelpVisible(true);
    }
    if (action === "cameraRest") {
      resetCamera();
    }
  };

  const handleMenuAction = (type: MenuActionType) => {
    setMemuVisible(false);
    if (type === "exit") {
      navigate("/", {
        replace: true,
      });
    }
    if (type === "help") {
      setHelpVisible(true);
    }
  };

  return (
    <div className={classNames(styles.root)}>
      <div id="scene" ref={divRef} />
      <div className={styles["action-menu"]}>
        {/* <Button
          onClick={() => {
            console.log(gameRef.current);
          }}
        >
          输出游戏 */}
        {/* </Button> */}
        {/* <Button
          onClick={() => {
            cameraControlRef.current?.reset();
          }}
        >
          重置相机位置
        </Button> */}
      </div>
      <Dice ref={diceRef} immediate={isLoading} />
      {gameRef.current?.playerList.map((player, index) => (
        <UserPortal
          key={player.id}
          index={index}
          player={player}
          isOperate={gameRef.current?.currentStagePlayerId === player.id}
          immediate={isLoading}
          onClick={() => {
            setPlayerInfo(gameRef.current?.playerList[index]);
            setPlayerInfoVisible(true);
          }}
        />
      ))}
      <CardSelectModal
        game={gameRef.current}
        open={cardSelectVisible}
        onCancel={() => setCardSelectVisible(false)}
        onCardSelect={handleCardSelect}
      />
      <PlayerSelectModal
        game={gameRef.current}
        open={playerInfoVisible}
        onCancel={() => setPlayerInfoVisible(false)}
        player={playerInfo}
      />
      {diceBtnVisible && operateEnable && <DiceBtn onClick={handleDice} />}
      <DiceResPanel
        diceResultList={gameRef.current?.diceResultList}
        ref={diceResPanelRef}
      />
      <CardSelectBtn
        onClick={() => setCardSelectVisible(true)}
        disabled={!operateEnable}
      />
      <ItemsPanel
        disabled={!operateEnable}
        ref={itemsPanelRef}
        effects={gameRef.current?.playerMap.get(tryGetUserId())?.effects || []}
        onDragStart={() => {
          isItemDrag.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isItemDrag.current = false;
          }, 16);
        }}
      />
      <GameOverModal game={gameRef.current} open={gameOverVisible} />
      <ActionBtnGroup onAction={handleActionBtnClick} />
      <MenuModal
        open={memuVisible}
        onCancel={() => setMemuVisible(false)}
        onAction={handleMenuAction}
      />
      <HelpModal
        open={helpVisible}
        maskClosable
        onCancel={() => {
          setHelpVisible(false);
        }}
      />
      <FinalCardModal
        type="win"
        open={winFinalCardVisible}
        game={gameRef.current}
        selfId={tryGetUserId()}
        onCancel={() => {
          setWinFinalCardVisible(false);
        }}
      />
      <FinalCardModal
        type="lose"
        open={loseFinalCardVisible}
        game={gameRef.current}
        selfId={tryGetUserId()}
        onCancel={() => {
          setLoseFinalCardVisible(false);
        }}
      />
      <Hint ref={hintRef} immediate={isLoading} />
      {(!isAssetsLoaded || isLoading) && <Loading />}
    </div>
  );
}

export default Game2;
