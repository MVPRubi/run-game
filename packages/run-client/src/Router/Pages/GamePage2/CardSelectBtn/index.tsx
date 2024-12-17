import React, { useEffect } from "react";
import classNames from "classnames";

import Card from "../../../../Components/Card";
import styles from "./index.module.less";

interface IProps {
  disabled?: boolean;
  onClick?: () => void;
}

const CardSelectBtn: React.FC<IProps> = (props) => {
  const { disabled = false, onClick } = props;

  // useEffect(() => {}, [disabled]);

  // const [style, setStyle] = React.useState<React.CSSProperties>({});

  // React.useEffect(() => {
  //   setStyle({
  //     transform: "scale(1.3) rotate(30deg) translateX(-25px) translateY(5px)",
  //   });
  // }, []);

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <div
      className={classNames(styles["card-select-btn"], {
        [styles["active"]]: !disabled,
      })}
      // style={style}
      {...props}
      onClick={handleClick}
    >
      <Card
        className={styles["card"]}
        style={{
          transform: "rotate(-20deg) translateY(10px)",
        }}
        card={{
          color: "red",
        }}
      />
      <Card
        className={styles["card"]}
        style={{
          left: 20,
        }}
        card={{
          color: "green",
        }}
      />
      <Card
        className={styles["card"]}
        style={{
          left: 40,
          transform: "rotate(20deg) translateY(10px)",
        }}
        card={{
          color: "blue",
        }}
      />
    </div>
  );
};

export default CardSelectBtn;
