import React, { useEffect, useState } from "react";
import { Modal, ModalProps } from "antd";
import { Card, Button } from "@components";
import { Game } from "@entity";

import styles from "./index.module.less";

interface IProps extends ModalProps {
  game: Game;
  selfId: string;
  type: FinalCardType;
}

const FinalCardModal: React.FC<IProps> = (props: IProps) => {
  const { game, selfId, type = "win", ...other } = props;

  const renderSelfFinalCard = () => {
    console.log(selfId, game.playerMap);
    return (
      <div className={styles["content"]}>
        {game.playerMap
          .get(selfId)
          ?.finalCards.filter(({ type: _type }) => _type === type)
          .map((card) => {
            return <Card card={card}></Card>;
          })}
      </div>
    );
  };

  return (
    <Modal
      footer={null}
      title={`竞猜${type === "win" ? "第一名" : "最后一名"}`}
      {...other}
    >
      <div className={styles["final-card-modal"]}>
        <div className={styles["title"]}>我的卡片</div>
        {renderSelfFinalCard()}
        <div className={styles["title"]}>已竞猜卡片</div>
        {game.finalCardList.length ? (
          <div className={styles["card-list"]}>
            {game.finalCardList.map((card) => (
              <Card card={card} className={styles["card"]} />
            ))}
          </div>
        ) : (
          <div className={styles["title"]}>暂无</div>
        )}
        <Button className={styles["btn"]}>确定</Button>
      </div>
    </Modal>
  );
};

export default FinalCardModal;
