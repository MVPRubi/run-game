import React, { useEffect, useRef } from "react";
import classNames from "classnames";
import gsap from "gsap";

import styles from "./index.module.less";
import diceIcon from "@assets/Icon/dice.svg";

interface IProps {
  className?: string;
}

export const DiceBtn: React.FC<IProps> = (props: IProps) => {
  const diceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 呼吸动画,间隔时间为2s
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, yoyo: true });
    tl.to(diceRef.current, { scale: 1.1, duration: 1 });
    tl.to(diceRef.current, { scale: 1, duration: 1 });
  }, []);

  return (
    <div
      {...props}
      className={classNames(styles["cube"], props.className)}
      ref={diceRef}
    >
      <img src={diceIcon} alt="" />
    </div>
  );
};

export default DiceBtn;
