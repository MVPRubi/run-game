import React, { useImperativeHandle } from "react";
import { Draggable } from "@components";
import { BoardEffect } from "@entity";
import classNames from "classnames";

import styles from "./index.module.less";

import handImg from "@assets/Icon/hand.svg";

interface IProps {
  disabled?: boolean;
  effects: BoardEffect[];
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const ItemsPanel = React.forwardRef((props: IProps, ref) => {
  const { onDragStart, onDragEnd, effects, disabled = false } = props;
  const currentDragEffect = React.useRef<BoardEffect | null>();

  const handleDragStart = (effect: BoardEffect) => {
    currentDragEffect.current = effect;
    onDragStart?.();
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  useImperativeHandle(ref, () => ({
    getCurrentDragEffect: () => {
      return currentDragEffect.current;
    },
  }));

  if (!effects || !effects.length) {
    return null;
  }

  return (
    <div
      className={classNames(styles["items-panel"], {
        [styles["active"]]: !disabled,
      })}
    >
      {!disabled && (
        <img
          src={handImg}
          className={classNames(styles["hand-icon"], {
            [styles["active"]]: !disabled,
          })}
        />
      )}
      {effects.map((effect, index) => (
        <Draggable
          key={index}
          onDragStart={() => {
            handleDragStart(effect);
          }}
          onDragEnd={() => {
            handleDragEnd();
          }}
        >
          <div className={styles["item"]}>
            <img src={effect.icon} />
          </div>
        </Draggable>
      ))}
    </div>
  );
});

export default ItemsPanel;
