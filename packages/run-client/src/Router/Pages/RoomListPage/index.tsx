import React, { useEffect, useState, useRef } from "react";
import RoomItem from "./RoomItem";
import { getRoomList, enterRoom } from "@services";
import { useNavigate } from "react-router-dom";
import { tryGetUserId } from "@utils";

import styles from "./index.module.less";
import emptyImg from "@assets/Image/empty.png";

interface IProps {}

const RoomPage: React.FC<IProps> = () => {
  const [roomList, setRoomList] = useState<IRoom[]>([]);
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await getRoomList();
      if (data) {
        setRoomList(data);
      }
    };
    init();
  }, []);

  const handleJoinRoom = async (roomId: string) => {
    const res = await enterRoom({
      roomId,
      userId: tryGetUserId(),
    });

    const { roomId: targetRoomId } = res.data;
    // 跳转到路由 /room/:roomId
    if (targetRoomId) {
      navigate(`/room/${targetRoomId}`);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.title}>房间列表</div>
      <div className={styles["room-list"]}>
        {roomList.length ? (
          roomList.map((room) => (
            <RoomItem key={room.id} room={room} onJoinRoom={handleJoinRoom} />
          ))
        ) : (
          <div className={styles["empty"]}>
            <img src={emptyImg} alt="" />
            <div>暂无房间</div>
          </div>
        )}
      </div>
      <div className={styles["btn-group"]}>
        <input
          ref={inputRef}
          className={styles["room-input"]}
          type="text"
          placeholder="输入房间号"
        />
        <div
          className={styles["enter-btn"]}
          onClick={() => {
            if (inputRef.current) {
              handleJoinRoom(inputRef.current.value);
            }
          }}
        >
          加入
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
