import React, { useState, useEffect, useRef } from "react";

interface IProps {
  color?: string;
}

export const HorseHeadMask = (
  props: React.SVGProps<SVGSVGElement> & IProps
) => {
  const [currColor, setCurrColor] = useState<string>(props.color || "#fff");
  const [prevColor, setPrevColor] = useState<string>(props.color || "#fff");
  const animateRef = useRef<SVGAnimateElement>(null);

  useEffect(() => {
    setCurrColor(props.color || "#fff");

    animateRef.current?.beginElement();
    setTimeout(() => {
      setPrevColor(props.color || "#fff");
    }, 500);
  }, [props.color]);

  return (
    <svg
      width="500"
      height="500"
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M135.5 191.5C138.5 191.5 145 190 149.5 186.5C154 183 156.5 178 156.5 178C156.5 178 160.5 178 164.5 176.5C168.5 175 183 168.5 189 162C195 155.5 192.5 145 192.5 145C192.5 145 199 129.5 199.5 118.5C200 107.5 197.5 101.5 197.5 101.5C197.5 101.5 198.5 85 197 81C195.5 77 193 72.9999 190.5 71.5C188 70 185.5 69 181 71C176.5 72.9999 175 81 175 81C175 81 168.5 81 167 78.5C165.5 76 161 71.4999 161 71.4999C161 71.4999 158 68.0001 153 71.0001C148 74.0001 149 79.5 149 79.5C149 79.5 131 87 121.5 94C112 101 103.5 113 102 117.5C100.5 122 100.5 129.25 101 131C101.5 132.75 103.5 133 106.5 133.5C106.5 133.5 105.5 129 105 125C104.5 121 105.5 117 105.5 117C105.5 117 106.5 125 108 128.5C109.5 132 111 134 113 135.5C115 137 122.5 136 122.5 136L118 151C118 151 115 163 114.5 168C114 173 114.5 176.5 118 182C121.5 187.5 126 189.5 126 189.5C126 189.5 132.5 191.5 135.5 191.5Z"
        fill="#fff"
      >
        <animate
          ref={animateRef}
          attributeName="fill"
          dur="0.5s"
          from={prevColor}
          to={currColor || "#fff"}
          restart="always"
          fill="freeze"
        />
      </path>
    </svg>
  );
};
