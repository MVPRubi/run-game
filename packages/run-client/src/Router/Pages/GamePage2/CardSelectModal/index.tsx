import React, {
  useEffect,
  useState,
  useLayoutEffect,
} from "react";
import { Game } from "@entity/Game.ts";
import { Modal, ModalProps } from "antd";
import Card from "../../../../Components/Card";
import CardFold from "../CardFold";
import { ICard } from "@types";

import styles from "./index.module.less";

interface IProps extends ModalProps {
  game: Game;
  onCardSelect?: (card: ICard) => void;
}

const CardSelectModal: React.FC<IProps> = (props: IProps) => {
  const { game, onCardSelect } = props;
  const { turn } = game;
  const { remainLotteryCardMap } = turn;
  const [cardList, setCardList] = useState([]);
  const [animCls, setAnimCls] = useState(styles.zoomIn);

  const handleAfterOpenChange = (visible) => {
    setCardList(Array.from(remainLotteryCardMap.values()));
  };

  useLayoutEffect(() => {
    if (props.open) {
      setAnimCls(styles.zoomIn);
    } else if (!props.open) {
      setAnimCls("");
    }
  }, [props.open]);

  const handleCardSelect = (seriesCard: ICard[]) => {
    console.log("handleCardSelect", seriesCard);
    props.onCardSelect?.(seriesCard[seriesCard.length - 1]);

    props.onCancel?.();
  };

  return (
    <Modal
      {...props}
      footer={null}
      transitionName={animCls}
      afterOpenChange={handleAfterOpenChange}
      title={"点击卡牌选择"}
    >
      <div
        className={styles["card-modal"]}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {cardList.map((seriesCard: ICard[], index) => (
          <CardFold
            key={index}
            cardList={[...seriesCard].reverse()}
            onClick={() => {
              handleCardSelect(seriesCard);
            }}
          />
        ))}
      </div>
    </Modal>
  );
};

export default CardSelectModal;
