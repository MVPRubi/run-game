import React, { useState, useEffect, useRef } from "react";

interface IProps {
  color?: string;
}

export const HorseBodyMask = (
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
        d="M163 212L165.5 176C165.5 176 186.5 169.5 195.5 152.5C204.5 135.5 198.5 102 198.5 102C198.5 102 207 106.5 216 112.5C225 118.5 233 129 233 129C233 129 242.643 142.5 246.5 156C250.357 169.5 251 183.5 253 192.5C255 201.5 258.5 204 261.5 208C264.5 212 267 213 272.5 214C278 215 278.5 215 278.5 215C278.5 215 276 220 271 221.5C266 223 296 221 300.5 221.5C305 222 318.5 226.5 318.5 226.5L331 238L338.5 251.5L341 268.5L340 284L336.5 298C336.5 298 333 308.5 331 315.5C329 322.5 332 332 332 332L333 352.5L330 379.5L320.5 424H292C292 424 295.654 414 297.5 406C299.346 398 303.5 380.5 303.5 369C303.5 357.5 305 342.5 302.5 332C300 321.5 294.5 300 291.5 300C288.5 300 290 347 290 347C290 347 287.5 378 286.5 383.5C285.5 389 276.5 424 276.5 424H250C250 424 255.5 409 257.5 403.5C259.5 398 261 391 263 381.5C265 372 266.5 358.5 265 347C263.5 335.5 258 313 254.5 312.5C251 312 233.5 314.5 233.5 314.5L232.5 369C232.5 369 230.5 391.5 229.5 398.5C228.5 405.5 224.5 424 224.5 424H176.5C176.5 424 180 413 181 405.5C182 398 182 378 182 371C182 367.48 178.403 342.739 173.5 321C168.653 299.511 164.5 290 163 277.5C161.5 265 161.5 258 161.5 246.5C161.5 235 163 212 163 212Z"
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
