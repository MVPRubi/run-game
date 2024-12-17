import React from "react";

import styles from "./index.module.less";

interface IProps {}

const Loading: React.FC<IProps> = () => {
  return (
    <div className={styles["root"]}>
      <span className={styles.loader}></span>
    </div>
  );
};

export default Loading;
