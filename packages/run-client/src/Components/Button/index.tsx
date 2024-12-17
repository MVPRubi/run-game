import React from "react";
import classNames from "classnames";

import styles from "./index.module.less";

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "primary" | "text";
  size?: "normal" | "small";
}

export const Button: React.FC<IProps> = (props: IProps) => {
  const {
    children,
    className,
    type = "primary",
    size = "normal",
    ...other
  } = props;

  return (
    <div
      className={classNames(
        styles.button,
        {
          [styles.primary]: type === "primary",
          [styles.text]: type === "text",
          [styles.normal]: size === "normal",
          [styles.small]: size === "small",
        },
        className
      )}
      {...other}
    >
      {children}
    </div>
  );
};
