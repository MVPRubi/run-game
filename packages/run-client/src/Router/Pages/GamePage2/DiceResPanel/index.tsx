import React, { useRef, useImperativeHandle, useState } from "react";
import { flushSync } from "react-dom";
import { getMapColor } from "@utils";

import styles from "./index.module.less";
import { DiceResult } from "@types";

interface IProps {
  diceResultList?: DiceResult[];
}

const DICE_WIDTH = 36;

const DiceResPanel = React.forwardRef((props, ref) => {
  const { diceResultList = [] } = props;
  const [showDiceResultList, setShowDiceResultList] = React.useState<
    DiceResult[]
  >([]);
  const [domHeight, setDomHeight] = useState(0);
  const latestDiceResultListRef = useRef<DiceResult[]>([]);

  const calcDomHeight = (length: number) => {
    if (!length) {
      return 0;
    }
    return (length && 1) * 2 * 12 + length * DICE_WIDTH + (length - 1) * 8;
  };

  React.useEffect(() => {
    latestDiceResultListRef.current = diceResultList;
  }, [diceResultList]);

  useImperativeHandle(ref, () => ({
    update: () => {
      const displayList = [...latestDiceResultListRef.current];
      flushSync(() => {
        setDomHeight(calcDomHeight(displayList.length));
      });
      setShowDiceResultList(displayList);
    },
  }));

  return (
    <div
      className={styles["dice-res-panel"]}
      style={{
        height: domHeight,
        padding: domHeight ? "12px 8px" : "0 8px",
      }}
    >
      {/* <div>本回合骰子</div> */}
      {showDiceResultList.map((diceResult, index) => {
        const backgroundColor =
          diceResult.color !== "white"
            ? getMapColor(diceResult.color)
            : "rgb(230, 230, 230)";
        return (
          <div
            key={index}
            className={styles["dice"]}
            style={{
              backgroundColor,
            }}
          >
            {diceResult.value}
          </div>
        );
      })}
    </div>
  );
});

export default DiceResPanel;
