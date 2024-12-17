import React, { useEffect, useRef } from "react";

interface IProps {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  children: React.ReactNode;
}

/**
 * 当拖动被包裹的 chidren 时，会出现一个 children 的克隆 dom 跟随鼠标或者手移动
 * 当鼠标或手松开时，可控制 克隆 dom 是否还原到 children 位置
 */
export const Draggable: React.FC<IProps> = (props: IProps) => {
  const { children, onDragStart, onDragEnd } = props;
  const dragRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  // const mouseStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dragDom = dragRef.current;
    if (!dragDom) return;

    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        startX = e.pageX;
        startY = e.pageY;
      } else {
        startX = e.touches[0].pageX;
        startY = e.touches[0].pageY;
      }

      const { left, top } = dragDom.getBoundingClientRect();
      // 当前位置 clone 一个 dom，克隆体包含元素所有视图信息，并且设置为 absolute
      const cloneDom = dragDom.cloneNode(true) as HTMLDivElement;
      cloneDom.style.position = "fixed";
      cloneDom.style.left = `${left}px`;
      cloneDom.style.top = `${top}px`;
      cloneDom.style.zIndex = "9999";
      cloneDom.style.opacity = "0.8";
      cloneDom.style.transform = "scale(1.2)";
      cloneDom.style.pointerEvents = "none";
      cloneDom.style.cursor = "pointer";
      cloneRef.current = cloneDom;
      dragRef.current?.parentNode?.appendChild(cloneDom);
      // 再将  cloneDom 从 parentNode 移到 document.body 下

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      document.addEventListener("touchmove", handleMouseMove,);
      document.addEventListener("touchend", handleMouseUp);

      onDragStart?.();
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      // 计算移动距离，移动 cloneRef.current
      if (e instanceof MouseEvent) {
        offsetX = e.pageX - startX;
        offsetY = e.pageY - startY;
      } else {
        offsetX = e.touches[0].pageX - startX;
        offsetY = e.touches[0].pageY - startY;
      }
      if (!cloneRef.current) return;
      // 当前位置加上偏移量
      const { left, top } = dragDom.getBoundingClientRect();
      cloneRef.current.style.left = `${left + offsetX}px`;
      cloneRef.current.style.top = `${top + offsetY}px`;
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      // 移除 cloneRef.current
      if (!cloneRef.current) return;
      cloneRef.current.parentNode?.removeChild(cloneRef.current);
      cloneRef.current = null;

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);

      onDragEnd?.();
    };

    dragDom.addEventListener("mousedown", handleMouseDown);
    dragDom.addEventListener("touchstart", handleMouseDown);

    return () => {
      dragDom.removeEventListener("mousedown", handleMouseDown);
      dragDom.removeEventListener("touchstart", handleMouseDown);
    };
  }, []);

  return <div ref={dragRef} style={{
    cursor: "pointer"
  }}>{children}</div>;
};
