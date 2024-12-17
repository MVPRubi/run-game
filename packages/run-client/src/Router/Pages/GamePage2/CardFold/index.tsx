import { CSSProperties } from "react";
import { ICard } from "@types";
import Card from "../../../../Components/Card";

import styles from "./index.module.less";

interface IProps {
  cardList: ICard[];
}

const CardFold: React.FC<IProps> = (props: IProps) => {
  const { cardList, ...other } = props;

  const calcStyle = (index: number): CSSProperties => {
    return {
      position: "absolute",
      top: index * 20,
    };
  };

  return (
    <div className={styles["card-fold"]}>
      {cardList.map((card, index) => (
        <Card key={card.color + card.value + index} card={card} style={calcStyle(index)} {...other} />
      ))}
    </div>
  );
};

export default CardFold;
