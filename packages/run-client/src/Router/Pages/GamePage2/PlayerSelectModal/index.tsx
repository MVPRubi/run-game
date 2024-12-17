import React, { useEffect, useState, useLayoutEffect } from "react";
import { Game } from "@entity";
import { Modal, ModalProps } from "antd";
import Card from "../../../../Components/Card";
import playerImg1 from "@assets/Image/player1.png";
import playerImg2 from "@assets/Image/player2.png";
import playerImg3 from "@assets/Image/player3.png";
import playerImg4 from "@assets/Image/player4.png";

import styles from "./index.module.less";

const playerImgList = [playerImg1, playerImg2, playerImg3, playerImg4];

interface IProps extends ModalProps {
  player?: IPlayer;
  game: Game;
}

const PlayerSelectModal: React.FC<IProps> = (props: IProps) => {
  const [, update] = useState({});
  const forceUpdate = React.useCallback(() => update({}), []);
  const [animCls, setAnimCls] = useState(styles.zoomIn);

  const { game, player, ...other } = props;
  const { turn, playerMap, playerList } = game;
  const playerTurnDataList = turn.getPlayerTurnData(player?.id || "");

  const index = playerList.findIndex((p) => p.id === player?.id);

  const handleAfterOpenChange = () => {
    forceUpdate();
  };

  useLayoutEffect(() => {
    if (props.open) {
      setAnimCls(styles.zoomIn);
    } else if (!props.open) {
      setAnimCls("");
    }
  }, [props.open]);

  return (
    <Modal
      {...other}
      footer={null}
      transitionName={animCls}
      rootClassName={styles["player-select-root"]}
      afterOpenChange={handleAfterOpenChange}
    >
      <div
        className={styles["player-modal"]}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <img src={playerImgList[index]} className={styles.img} />
        <div className={styles["content"]}>
          <div className={styles["head"]}>
            <div className={styles["name"]}>玩家: {player?.name}</div>
          </div>
          <div className={styles["title"]}>本局已获得总金币:</div>
          <div className={styles["title"]}>
            {playerMap.get(player?.id)?.coins || 0}
          </div>
          <div className={styles["title"]}>本回合骰子金币:</div>
          <div className={styles["title"]}>{playerTurnDataList?.coin | 0}</div>
          <div className={styles["title"]}>本回合竞猜卡片: </div>
          {playerTurnDataList?.lotteryCardList?.length ? (
            <div className={styles["card-list"]}>
              {(playerTurnDataList?.lotteryCardList || []).map((card) => (
                <Card card={card} className={styles["card"]} />
              ))}
            </div>
          ) : (
            <div className={styles["title"]}>暂无</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PlayerSelectModal;
