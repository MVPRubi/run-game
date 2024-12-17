import React from "react";
import classNames from "classnames";
import { getMapColor, generateDarkAndLightColors } from "@utils";

import styles from "./index.module.less";

import horseImg from "@assets/Image/horse.png";

interface IProps {
  className?: string;
  card: {
    color: string;
    value?: number;
  };
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card: React.FC<IProps> = (props: IProps) => {
  const {
    card: { color, value } = {},
    className,
    onClick,
    style,
    ...other
  } = props;
  return (
    <div
      className={classNames(styles["card"], className)}
      style={{
        ...style,
        borderColor: generateDarkAndLightColors(getMapColor(color), {
          lightConstant: 60,
        })?.lightColor,
        backgroundColor: generateDarkAndLightColors(getMapColor(color), {
          lightConstant: 120,
        })?.lightColor,
      }}
      onClick={onClick}
      {...other}
    >
      <img src={horseImg}></img>
      <div className={styles["content"]}>
        {value && <div className={styles["top-value"]}>{value}</div>}
        <div
          className={styles["img"]}
          style={{
            backgroundColor: color,
          }}
        ></div>
        {value && <div className={styles["coin"]}>{value}</div>}
      </div>
    </div>
  );
};

export default Card;
