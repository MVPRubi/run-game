import React, { useState, useLayoutEffect } from "react";
import { Modal, ModalProps } from "antd";

import styles from "./index.module.less";

interface IProps extends ModalProps {}

const PlayerSelectModal: React.FC<IProps> = (props: IProps) => {
  const [, update] = useState({});
  const forceUpdate = React.useCallback(() => update({}), []);
  const [animCls, setAnimCls] = useState(styles.zoomIn);

  const handleAfterOpenChange = () => {
    forceUpdate();
  };

  useLayoutEffect(() => {
    if (props.open) {
      setAnimCls(styles.zoomIn);
    } else if (!props.open) {
      setAnimCls("");
    }
  }, [props.open]);

  return (
    <Modal
      {...props}
      footer={null}
      transitionName={animCls}
      afterOpenChange={handleAfterOpenChange}
      title="游戏说明"
    >
      <div
        className={styles["help-modal"]}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={styles.l1}>
          游戏的目标是通过押注小马的赛跑结果来赚取最多的金币。游戏由多个分段赛组成，每个分段赛结束时，玩家可以根据自己的下注牌获得金币奖励或惩罚。最终，拥有最多金币的玩家获胜。
        </div>
        <div className={styles.l1}>游戏的主要金币素有:</div>
        <div className={styles.l2}>1 个骰子，决定小马的移动距离。</div>
        <div className={styles.l2}>
          5 个不同颜色的小马，分别对应 5 个不同颜色的骰子，数字只有 1-3。
        </div>
        <div className={styles.l2}>
          5 种颜色的分段赛下注牌，分别有 5 金币，3 金币，2
          金币的面值，用来下注当前分段赛的第一名和第二名。
        </div>
        <div className={styles.l1}>游戏的基本流程如下:</div>
        <div>在每个分段赛中，玩家轮流进行以下四种动作之一</div>
        <div className={styles.l2}>
          摇骰子：玩家摇出一个骰子，然后将对应颜色的小马向前移动骰子上的格数，如果有其他小马在同一格或前方的格子上，则一起移动或叠在一起。摇骰子的玩家立即获得
          1 金币。
        </div>
        <div className={styles.l2}>
          下注分段赛：玩家从任意一种颜色的分段赛下注牌中选择一张，放在自己面前，暗示自己认为该颜色的小马会在当前分段赛中获得第一名或第二名。每种颜色的分段赛下注牌只能被一名玩家选择，先选的玩家可以拿到面值更高的牌。
        </div>
        <div className={styles.l2}>
          放置地形图版：玩家可以将自己的地形图版放在跑道上的任意一格，但不能放在起点或终点，也不能放在已经有地形图版的格子上。地形图版有两种，一种是
          +1，一种是
          -1。当小马进入有地形图版的格子时，必须根据地形图版的正反面向前或向后移动一格，如果有其他小马在同一格或前方的格子上，则一起移动或叠在一起。放置地形图版的玩家可以在小马进入自己的地形图版时获得
          1 金币。
        </div>
        <div className={styles.l2}>
          当所有 5
          个骰子都被摇出时，当前分段赛结束，进行结算。玩家根据自己的分段赛下注牌获得金币奖励或惩罚，第一名对应颜色的卡牌能获得卡牌上全部金币，第二名能获得
          1 金币，其他颜色的卡片扣除 1
          金币。然后重置道具和所有牌，开始下一个分段赛。
        </div>
        <div className={styles.l1}>
          当有一只或多只小马到达或超过终点时，游戏结束，进行最终结算。玩家根据自己的下注卡获得金币奖励或惩罚。如果有多只小马叠在一起，最上面的小马为第一名，最下面的小马为最后一名。最终，拥有最多金币的玩家获胜，如果有平局，则平分胜利。
        </div>
      </div>
    </Modal>
  );
};

export default PlayerSelectModal;
