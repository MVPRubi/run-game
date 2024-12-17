import React, { useEffect, useState, useRef } from "react";
import { playerColorList } from "@constant";
import classNames from "classnames";
import {
  GameEventEmitter,
  EventType,
  IAddCardMessage,
  IAddCoinMessage,
} from "@event";
import { getMapColor, generateDarkAndLightColors } from "@utils";

import playerImg1 from "@assets/Image/player-head1.png";
import playerImg2 from "@assets/Image/player-head2.png";
import playerImg3 from "@assets/Image/player-head3.png";
import playerImg4 from "@assets/Image/player-head4.png";
import CoinIcon from "@assets/Icon/coin.svg";

import styles from "./index.module.less";

const playerImgList = [playerImg1, playerImg2, playerImg3, playerImg4];

interface IProps {
  index?: number;
  onClick?: () => void;
  player?: {
    id: string;
    name: string;
  };
  isOperate?: boolean;
  immediate?: boolean;
}

const DISPLAY_TIME = 2000;

const UserPortal: React.FC<IProps> = (props) => {
  const msgQueueRef = useRef<
    {
      type: string;
      msg: Partial<IAddCoinMessage & IAddCardMessage>;
    }[]
  >([]);
  const msgRoot = useRef<HTMLDivElement>(null);
  const msgBoxDomMap = useRef<Map<HTMLDivElement, HTMLDivElement>>(new Map());
  const isShowMessage = useRef(true);

  const { index = 0, onClick, player, immediate } = props;
  const { name } = player || {};
  const style = {
    top: 40 + index * 60,
    // borderColor: playerColorList[index],
  };

  const displayMessage = () => {
    const msg = msgQueueRef.current.shift();
    if (!msg || !isShowMessage.current) {
      return;
    }
    const msgDom = document.createElement("div");
    msgDom.className = styles["msg-box"];
    if (msg?.type === EventType.addCoin) {
      msgDom.innerHTML = `
      <div class="${styles["coin"]}">+${msg.msg?.coin}</div>
      <img class="${styles["coin-icon"]}" src="${CoinIcon}"></img>
      `;
    } else {
      const color = msg?.msg?.card.color;
      msgDom.innerHTML = `
        <div class="${styles["card"]}" style="background-color: ${
        generateDarkAndLightColors(getMapColor(color), {
          lightConstant: 120,
        })?.lightColor
      };border-color: ${
        generateDarkAndLightColors(getMapColor(color), {
          lightConstant: 60,
        })?.lightColor
      }">
          <div class="${styles["coin"]}">${msg?.msg?.card.value}</div>
        </div>
      `;
    }
    msgRoot.current?.appendChild(msgDom);
    msgBoxDomMap.current.set(msgDom, msgDom);
    setTimeout(() => {
      msgDom.className = `${styles["msg-box"]} ${styles["leave"]}`;
    }, DISPLAY_TIME - 500);

    setTimeout(() => {
      msgDom.remove();
      msgBoxDomMap.current.delete(msgDom);
    }, DISPLAY_TIME);
  };

  useEffect(() => {
    isShowMessage.current = !immediate;
  }, [immediate]);

  useEffect(() => {
    const handleAddCard = (msg: IAddCardMessage) => {
      const { playerId } = msg;
      if (playerId !== player?.id) {
        return;
      }
      msgQueueRef.current.push({
        type: EventType.addCard,
        msg,
      });
      displayMessage();
    };
    const handleAddCoin = (msg: IAddCoinMessage) => {
      const { playerId } = msg;
      if (playerId !== player?.id) {
        return;
      }
      msgQueueRef.current.push({
        type: EventType.addCoin,
        msg,
      });
      displayMessage();
    };

    GameEventEmitter.on(EventType.addCard, handleAddCard);
    GameEventEmitter.on(EventType.addCoin, handleAddCoin);

    return () => {
      GameEventEmitter.off(EventType.addCard, handleAddCard);
      GameEventEmitter.off(EventType.addCoin, handleAddCoin);

      msgBoxDomMap.current.forEach((dom) => {
        dom.remove();
        msgBoxDomMap.current.delete(dom);
      });
    };
  }, []);

  return (
    <div
      className={classNames(styles["user-portal"], {
        [styles["is-operate"]]: props.isOperate,
      })}
      onClick={onClick}
      style={style}
    >
      <span className={styles["name"]}>{name}</span>
      <img className={styles["img"]} src={playerImgList[index]} />

      <div className={styles["msg-root"]} ref={msgRoot}></div>
    </div>
  );
};

export default UserPortal;
