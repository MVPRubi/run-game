import React from "react";

import styles from "./index.module.less";

type IState = "ready" | "idle";

interface IProps {
  player: {
    id: string;
    name: string;
    state: IState;
  };
  children?: React.ReactElement;
  isOwner: boolean;
  headSrc: string;
  color?: string;
}

const PlayerItem: React.FC<IProps> = (props: IProps) => {
  const { player, isOwner, headSrc, color } = props;
  const { name, state } = player;

  const renderStateText = (state: IState) => {
    if (state === "ready") {
      return "准备中";
    }
    return "未准备";
  };

  return (
    <div className={styles["player-item"]}>
      <div className={styles["left"]}>
        <img
          className={styles["img"]}
          src={headSrc}
          style={{
            borderColor: color,
          }}
        ></img>
        <div className={styles["name"]}>
          {name}
          {isOwner ? " (房主)" : ""}
        </div>
      </div>
      <div className={styles["right"]}>
        <div className={styles["status"]}>{renderStateText(state)}</div>
      </div>
    </div>
  );
};

export default PlayerItem;
