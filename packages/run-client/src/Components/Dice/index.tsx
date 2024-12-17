import React, { useState, useEffect, useImperativeHandle } from "react";
import classNames from "classnames";
import { DiceResult } from "@types";
import { getMapColor } from "@utils";

import styles from "./index.module.less";

interface IProps {
  remindDiceType: string[];
  diceResult: DiceResult;
  // 是否立即
  immediate?: boolean;
}

const sinShort = (t: number) => {
  return Math.sin((2 * Math.PI * t) / 3);
};

const DEFAULT_COLOR = "rgb(128, 124, 124)";
const DISTANCE_STEP = 2;

let ISTEST = true;
// 生产环境下不测试
if (process.env.NODE_ENV === "production") {
  ISTEST = false;
}

const Dice: React.FC<IProps> = React.forwardRef((props: IProps, ref) => {
  const { immediate } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>(DEFAULT_COLOR);
  const [value, setValue] = useState<string | number>("?");
  const cubeRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!immediate) {
      setValue("?");
      setBgColor(DEFAULT_COLOR);
    }
  }, [immediate]);

  // 背景色为 DEFAULT_HOUSE_COLOR 其中一个颜色，并且没200ms切换一次

  const addRotateAnimation = () => {
    if (!cubeRef.current) {
      return;
    }
    /*
     * 创建一个骰子以一个顶点为圆心的旋转动画
     * 1. 以一个顶点为圆心，旋转 1800 度
     * 2. 动画曲线有很快到很慢
     */
    const keyframes = [
      {
        transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
      },
      {
        transform: "rotateX(1790deg) rotateY(1790deg) rotateZ(1800deg)",
      },
    ];
    const options = {
      duration: 3000,
      // 自定义动画曲线有很快到很慢
      easing: "cubic-bezier(0.42, 0, 0.58, 1)",
    };
    cubeRef.current.animate(keyframes, options);
  };

  const showDiceResult = ({
    diceResult,
    onAnimEnd,
    onAnimStart,
  }: {
    diceResult: DiceResult;
    onAnimEnd?: () => void;
    onAnimStart?: () => void;
  }) => {
    onAnimStart?.();
    setVisible(true);

    if (ISTEST || immediate) {
      setVisible(false);
      setBgColor(diceResult.color);
      setValue(diceResult.value);
      onAnimEnd?.();
      return;
    }

    const cube = cubeRef.current;
    if (!cube) {
      return;
    }
    let distance = 0;
    const timeNow = performance.now();
    function move() {
      const now = performance.now();
      // 3 秒后回到原点
      if (now - timeNow > 3000) {
        distance = 0;
        return;
      }
      const step = 2;
      if (now - timeNow < 1500) {
        distance += step;
      } else {
        distance -= step;
      }
      const x = distance * Math.cos(now / 1000);
      const y = distance * sinShort(now / 1000);
      cube!.style.left = x + "px";
      cube!.style.top = y + "px";
      requestAnimationFrame(move);
    }

    addRotateAnimation();
    move();

    // 延时设置结果
    setTimeout(() => {
      const backgroundColor =
        diceResult.color !== "white"
          ? getMapColor(diceResult.color)
          : "rgb(230, 230, 230)";
      setBgColor(backgroundColor);
    }, 2500);
    setTimeout(() => {
      setValue(diceResult.value);
    }, 3000);

    // 重置
    setTimeout(() => {
      setVisible(false);
      setBgColor(DEFAULT_COLOR);
      setValue("?");

      onAnimEnd?.();
    }, 4000);
  };

  useImperativeHandle(ref, () => ({
    showDiceResult,
  }));

  const renderCubeFace = () => {
    const classNameList = [
      styles["front"],
      styles["back"],
      styles["top"],
      styles["bottom"],
      styles["left"],
      styles["right"],
    ];
    return classNameList.map((className) => (
      <div
        className={className}
        key={className}
        style={{
          backgroundColor: bgColor,
        }}
      >
        {value}
      </div>
    ));
  };

  return (
    <div
      className={classNames(styles["dice-root"], {
        [styles["hide"]]: !visible,
      })}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className={styles["cube"]} ref={cubeRef}>
        {renderCubeFace()}
      </div>
    </div>
  );
});

export default Dice;
