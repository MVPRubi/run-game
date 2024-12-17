import React, { useState, useLayoutEffect } from "react";
import { Modal, ModalProps } from "antd";
import { Button } from "@components";

import styles from "./index.module.less";

export type MenuActionType = "help" | "exit";

interface IProps extends ModalProps {
  onAction?: (type: MenuActionType) => void;
}

const MenuPanel: React.FC<IProps> = (props: IProps) => {
  const [animCls, setAnimCls] = useState(styles.zoomIn);

  useLayoutEffect(() => {
    if (props.open) {
      setAnimCls(styles.zoomIn);
    } else if (!props.open) {
      setAnimCls("");
    }
  }, [props.open]);

  const handleClick = (type: MenuActionType) => {
    props.onAction?.(type);
  };

  return (
    <Modal
      {...props}
      footer={null}
      transitionName={animCls}
      maskClosable
      title={"菜单"}
    >
      <div className={styles["menu-modal"]}>
        {/* <div className={styles["head"]}>菜单</div> */}
        <Button
          type="text"
          style={{
            marginTop: 12,
          }}
          onClick={() => handleClick("help")}
        >
          帮助
        </Button>
        <Button type="text" onClick={() => handleClick("exit")}>
          退出
        </Button>
      </div>
    </Modal>
  );
};

export default MenuPanel;
