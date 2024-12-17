import React from "react";

import styles from "./index.module.less";

interface IProps {
  room: IRoom;
  onJoinRoom: (roomId: string) => void;
}

const RoomItem: React.FC<IProps> = (props: IProps) => {
  const { room, onJoinRoom } = props;
  const { name, ownerId, playerList, id } = room;

  const owner = playerList.find((player) => player.id === ownerId);

  return (
    <div className={styles["room-item"]}>
      <div className={styles["left"]}>
        <div className={styles["name"]}>{name}</div>
        <div className={styles["owner"]}>
          房主: {owner?.name} 人数: {playerList.length} / 4
        </div>
      </div>
      <div className={styles["right"]}>
        {playerList.length < 4 && (
          <div
            className={styles["status"]}
            onClick={() => {
              onJoinRoom(id);
            }}
          >
            加入
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomItem;
