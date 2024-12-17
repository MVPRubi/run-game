import React, { useEffect, useRef, useState } from "react";
import Board from "./Board";
import { connect, close } from "@services";
import { get } from "lodash-es";
import { tryGetUserId } from "@utils";
import { Select, Button } from "antd";

import styles from "./index.module.less";

interface IProps {}

const CardOption = [
  {
    label: "red",
    value: "red",
  },
  {
    label: "blue",
    value: "blue",
  },
  {
    label: "green",
    value: "green",
  },
  {
    label: "yellow",
    value: "yellow",
  },
  {
    label: "purple",
    value: "purple",
  },
];

const GamePage: React.FC<IProps> = (props: IProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [horseList, setHorseList] = useState([]);
  const [gameId, setGameId] = useState("");
  const [currentPlayerId, setCurrentPlayerId] = useState("");
  const selfUserId = tryGetUserId();
  const messageListRef = useRef<string[]>([]);
  const [, setUpdate] = useState({});
  const forceUpdate = () => setUpdate({});

  const addMessage = (message: string) => {
    messageListRef.current.push(message);
  };

  const actionDisabled = currentPlayerId !== selfUserId;

  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    console.log("handleMessage game", data);

    if (data.action === "message") {
      addMessage(data.payload.message);
      forceUpdate();
      return;
    }

    const horseList = get(data, "payload.game.horseList");
    const id = get(data, "payload.game.id");
    const currentPlayerId = get(data, "payload.game.currentPlayerId");

    setHorseList(horseList);
    setGameId(id);
    setCurrentPlayerId(currentPlayerId);
  };

  const connectGameSocket = async () => {
    const socket = await connect("game");
    if (socket) {
      socket.addEventListener("message", handleMessage);

      socket.send(
        JSON.stringify({
          type: "init",
          payload: {
            userId: selfUserId,
            gameId: "test_game_id",
          },
        })
      );

      socketRef.current = socket;
    }
  };

  const handleRun = () => {
    socketRef.current?.send(
      JSON.stringify({
        type: "test",
        payload: {
          id: gameId,
        },
      })
    );
  };

  const handleDice = () => {
    socketRef.current?.send(
      JSON.stringify({
        type: "dice",
        payload: {
          gameId,
          userId: selfUserId,
        },
      })
    );
  };

  const handleRestart = () => {
    socketRef.current?.send(
      JSON.stringify({
        type: "restart",
        payload: {
          id: gameId,
        },
      })
    );
  };

  useEffect(() => {
    connectGameSocket();

    return () => {
      socketRef.current?.removeEventListener("message", handleMessage);
      close();
      socketRef.current = null;
    };
  }, []);

  return (
    <div className={styles.root}>
      <Board horseList={horseList}></Board>
      <div>游戏 Id: {gameId}</div>
      <div>回合：1，</div>
      <div>当前操作玩家：{currentPlayerId}</div>
      <div>
        <Button onClick={handleDice} disabled={actionDisabled}>
          投骰子
        </Button>
      </div>
      <div>
        <Select
          style={{ width: 100 }}
          options={CardOption}
          disabled={actionDisabled}
        />
        <Button disabled={actionDisabled}>选择卡片</Button>
      </div>
      <div>
        <Button disabled={actionDisabled}>结束阶段</Button>
        <Button disabled={actionDisabled} onClick={handleRestart}>
          重置
        </Button>
      </div>
      <div className={styles["user-id"]}>{selfUserId}</div>
      <div className={styles["message-box"]}>
        <div>
          服务端消息：
          <Button
            onClick={() => {
              messageListRef.current = [];
              forceUpdate();
            }}
          >
            清除消息
          </Button>
        </div>
        {messageListRef.current.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </div>
  );
};

export default GamePage;
