import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connect, close } from "../../../Services";
import PlayerItem from "./PlayerItem";
import { tryGetUserId, tryGetUser } from "@utils";
import { playerImgList } from "@constant";

import styles from "./index.module.less";

const playerColorList = ["#5B60FD", "#FF565E ", "#43DFA8", "#2BD9F5"];

interface IProps {}

const RoomPage: React.FC<IProps> = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [playerList, setPlayerList] = useState([]);
  const [roomOwnerId, setRoomOwnerId] = useState({});
  const [roomPlayer, setRoomPlayer] = useState({});
  const socketRef = useRef<WebSocket | null>(null);
  const selfUserId = tryGetUserId();
  const isOwner = selfUserId === roomOwnerId;

  const handleMessage = (event: MessageEvent) => {
    const { payload, action } = JSON.parse(event.data);
    console.log("payload", payload);
    switch (action) {
      case "startGame":
        socketRef.current?.close();
        const { gameId } = payload;
        navigate(`/game2/${gameId}`);
        break;
      default:
        const { playerList, ownerId } = payload;
        playerList.forEach((player) => {
          if (player.id === selfUserId) {
            setRoomPlayer(player);
          }
        });

        setRoomOwnerId(ownerId);
        if (playerList) {
          setPlayerList(playerList);
        }
        break;
    }
  };

  const connectRoomSocket = async () => {
    const socket = await connect("room");
    if (socket) {
      socket.addEventListener("message", handleMessage);
      socket.send(
        JSON.stringify({
          type: "tick",
          payload: {
            ...tryGetUser(),
            roomId,
          },
        })
      );

      socketRef.current = socket;
    }
  };

  useEffect(() => {
    connectRoomSocket();

    return () => {
      socketRef.current?.removeEventListener("message", handleMessage);
      close();
      socketRef.current = null;
    };
  }, []);

  const handleLeave = () => {
    socketRef.current?.send(
      JSON.stringify({
        type: "leave",
        payload: {
          userId: tryGetUserId(),
          roomId,
        },
      })
    );

    // 回退到上一个路由
    navigate(-1);
  };

  const handleReady = () => {
    socketRef.current?.send(
      JSON.stringify({
        type: "changeReady",
        payload: {
          roomId,
          userId: selfUserId,
        },
      })
    );
  };

  const handleStart = () => {
    // 判断每个玩家是否准备就绪
    const isAllReady = playerList.every((player) => player.state === "ready");

    if (!isAllReady) {
      return;
    }

    socketRef.current?.send(
      JSON.stringify({
        type: "startGame",
        payload: {
          roomId,
        },
      })
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.title}>
        房间<div className={styles["sub-title"]}>{roomId}</div>
      </div>
      <div className={styles["member-list"]}>
        {playerList.map((player) => (
          <PlayerItem
            player={player}
            key={player?.id}
            isOwner={roomOwnerId === player?.id}
            headSrc={playerImgList[playerList.indexOf(player)]}
            color={playerColorList[playerList.indexOf(player)]}
          />
        ))}
      </div>
      <div className={styles["btn-group"]}>
        <div className={styles["leave-btn"]} onClick={handleLeave}>
          退出
        </div>
        {isOwner ? (
          <div className={styles["state-btn"]} onClick={handleStart}>
            开始
          </div>
        ) : (
          <div className={styles["state-btn"]} onClick={handleReady}>
            {roomPlayer?.state === "idle" ? "准备" : "取消准备"}
          </div>
        )}
      </div>
      <div className={styles["user-id"]}>id: {selfUserId || "未知"}</div>
    </div>
  );
};

export default RoomPage;
