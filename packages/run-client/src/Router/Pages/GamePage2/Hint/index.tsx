import React, { useRef, useImperativeHandle, useState, useEffect } from "react";

import styles from "./index.module.less";

interface IProps {
  text: string;
  immediate?: boolean;
}

const Hint = React.forwardRef((prop: IProps, ref) => {
  const { immediate = false } = prop;
  const immediateRef = useRef(immediate);
  useEffect(() => {
    immediateRef.current = immediate;
  }, [immediate]);

  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useImperativeHandle(ref, () => ({
    show: (msg: string, duration: number = 2000) => {
      if (immediateRef.current) {
        setVisible(true);
        setMsg(msg);
        setVisible(false);
        return;
      }

      setVisible(true);
      setMsg(msg);

      setTimeout(() => {
        setVisible(false);
      }, duration);
    },
  }));

  if (!visible) return null;

  return (
    <div className={styles.hint}>
      <div className={styles.mask}></div>
      <div className={styles.content}>{msg}</div>
    </div>
  );
});

export default Hint;
