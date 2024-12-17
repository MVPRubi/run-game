import React from "react";

import settingIcon from "@assets/Icon/icon-setting.png";
import helpIcon from "@assets/Icon/icon-help.png";
import cameraRestIcon from "@assets/Icon/icon-camrea-reset.png";
import styles from "./index.module.less";

export type ActionType = "setting" | "help" | "cameraRest";

interface IProps {
  onAction?: (type: ActionType) => void;
}

const ActionBtnGroup: React.FC<IProps> = (props: IProps) => {
  const { onAction } = props;

  const handleCLick = (type: ActionType) => {
    onAction?.(type);
  };

  return (
    <div className={styles["action-btn-group"]}>
      <div
        className={styles["btn"]}
        onClick={() => {
          handleCLick("cameraRest");
        }}
      >
        <img src={cameraRestIcon} />
      </div>
      <div
        className={styles["btn"]}
        onClick={() => {
          handleCLick("help");
        }}
      >
        <img src={helpIcon} />
      </div>
      <div
        className={styles["btn"]}
        onClick={() => {
          handleCLick("setting");
        }}
      >
        <img src={settingIcon} />
      </div>
    </div>
  );
};

export default ActionBtnGroup;
