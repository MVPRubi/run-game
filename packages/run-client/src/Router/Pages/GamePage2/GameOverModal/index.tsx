import React, { useEffect, useState, useLayoutEffect } from "react";
import { Game } from "@entity/Game.ts";
import { Modal, ModalProps } from "antd";
import { playerImgList } from "@constant";
import { useNavigate } from "react-router-dom";

import CoinIcon from "@assets/Icon/coin.svg";
import styles from "./index.module.less";

interface IProps extends ModalProps {
  game: Game;
}

const GameOverModal: React.FC<IProps> = (props: IProps) => {
  const { game } = props;
  const [animCls, setAnimCls] = useState(styles.zoomIn);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (props.open) {
      setAnimCls(styles.zoomIn);
    } else if (!props.open) {
      setAnimCls("");
    }
  }, [props.open]);

  const playerList = (game.playerList || [])
    .map((player) => ({
      coins: game.playerMap.get(player.id).coins,
      ...player,
    }))
    .sort((a, b) => b.coins - a.coins);

  const handleLeave = () => {
    navigate("/", {
      replace: true,
    });
  };

  return (
    <Modal
      {...props}
      footer={null}
      transitionName={animCls}
      closable={false}
      wrapClassName={styles["game-over-modal"]}
    >
      <div className={styles["content"]}>
        <div className={styles["title"]}>游戏结束</div>
        <div className={styles["player-list"]}>
          {playerList.map((player, index) => (
            <div key={index}>
              <div className={styles["player-item"]}>
                <div className={styles["left"]}>
                  <div> {`第 ${index + 1} 名`} </div>
                  <img
                    src={playerImgList[index]}
                    className={styles["img"]}
                    alt=""
                  />
                  <div className={styles["name"]}>{player.name}</div>
                </div>
                <div className={styles["right"]}>
                  <img className={styles["coin-icon"]} src={CoinIcon}></img>
                  <div className={styles["coin"]}>{player.coins}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles["leave-btn"]} onClick={handleLeave}>
          返回首页
        </div>
      </div>
    </Modal>
  );
};

export default GameOverModal;
