import React, { useState, useEffect, useImperativeHandle } from "react";
import { DEFAULT_DICE_COLOR } from "@constant";
import classNames from "classnames";
import { DiceResult } from "@types";

import styles from "./index.module.less";

interface IProps {
  remindDiceType: string[];
  diceResult: DiceResult;
  className?: string;
  onlyFace?: boolean;
}

export const DiceBtn2: React.FC<IProps> = React.forwardRef(
  (props: IProps, ref) => {
    const { onlyFace: onlyFront = false } = props;
    const [visible, setVisible] = useState<boolean>(false);
    const [bgColor, setBgColor] = useState<string>(
      props.color || DEFAULT_DICE_COLOR
    );
    const [value, setValue] = useState<string | number>(props.value || "?");
    const cubeRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      setBgColor(props.color || DEFAULT_DICE_COLOR);
      setValue(props.value || "?");
    }, [props.value, props.color]);

    const renderCubeFace = () => {
      const classNameList = onlyFront
        ? [styles["front"], styles["top"], styles["right"]]
        : [
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
        {...props}
        className={classNames(styles["cube"], props.className)}
        ref={cubeRef}
      >
        {renderCubeFace()}
      </div>
    );
  }
);

export default DiceBtn2;
