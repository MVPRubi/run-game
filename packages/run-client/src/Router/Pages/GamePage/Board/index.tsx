import React from "react";
import { groupBy } from "lodash-es";

import styles from "./index.module.less";

interface IProps {}

interface IHorse {
  color: string;
  zPosition: number;
}

interface IBoardItem {
  horseList?: IHorse[];
}

const BoardItem = (props: IBoardItem) => {
  const { horseList } = props;

  return (
    <div className={styles["board-item"]}>
      {horseList?.map((horse, index) => {
        return (
          <div
            key={index}
            className={styles["horse"]}
            style={{
              backgroundColor: horse.color,
              bottom: horse.zPosition * 15,
            }}
          ></div>
        );
      })}
    </div>
  );
};

const Board: React.FC<IProps> = (props: IProps) => {
  const { horseList } = props;
  console.log("horseList", groupBy(horseList, "position"));
  const groupByPosition = groupBy(horseList, "position");

  return (
    <div className={styles["board-root"]}>
      {new Array(20).fill(0).map((_, index) => {
        const horseList = groupByPosition[index] || [];
        return <BoardItem key={index} horseList={horseList}></BoardItem>;
      })}

    </div>
  );
};

export default Board;
