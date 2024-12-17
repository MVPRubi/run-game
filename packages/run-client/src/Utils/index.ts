import { Horse } from "src/Entity/Horse";
import { DiceResult, DiceType } from "@types";

export * from "./user";

export const randomInt = (min: number = 0, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const isBottomHorse = (horse: Horse) => {
  return !horse.under;
};

export const isBlackorWhite = (color: string) => {
  return color === "black" || color === "white";
};

export const getBottomHorse = (horse: Horse) => {
  let bottomHorse = horse;
  while (bottomHorse.under) {
    bottomHorse = bottomHorse.under;
  }
  return bottomHorse;
};

export const getTopHorse = (horse: Horse) => {
  let topHorse = horse;
  while (topHorse.upper) {
    topHorse = topHorse.upper;
  }
  return topHorse;
};

export const rollDiceResult = (remindDiceType: DiceType[] = []): DiceResult => {
  const diceIndex = Math.floor(Math.random() * remindDiceType.length);
  const diceType = remindDiceType[diceIndex];
  return {
    type: diceType,
    // 如果是 custom 骰子，随机黑或者白
    color:
      diceType === "custom"
        ? ["black", "white"][Math.floor(Math.random() * 2)]
        : diceType,
    value: Math.floor(Math.random() * 3) + 1,
  } as DiceResult;
};

const colorMap = {
  red: "#CD184F",
  blue: "#219BE4",
  green: "#60D3AA",
  yellow: "#F4D35E",
  purple: "#7338AC",
  white: "#ffffff",
  black: "#000000",
};

export const getMapColor = (color?: string | HorseColor) => {
  return colorMap[color as HorseColor] || color;
};

const darken = (rgb: number[], darkFactor: number = 0.8) => {
  const newR = Math.floor(rgb[0] * darkFactor);
  const newG = Math.floor(rgb[1] * darkFactor);
  const newB = Math.floor(rgb[2] * darkFactor);
  return [newR, newG, newB];
};
const lighten = (rgb: number[], lightConstant: number = 200) => {
  let newR = rgb[0] + lightConstant;
  let newG = rgb[1] + lightConstant;
  let newB = rgb[2] + lightConstant;
  newR = Math.max(0, Math.min(255, newR));
  newG = Math.max(0, Math.min(255, newG));
  newB = Math.max(0, Math.min(255, newB));
  return [newR, newG, newB];
};
const rgbToHex = (rgb: number[]) => {
  const rHex = rgb[0].toString(16).padStart(2, "0");
  const gHex = rgb[1].toString(16).padStart(2, "0");
  const bHex = rgb[2].toString(16).padStart(2, "0");
  const hex = "#" + rHex + gHex + bHex;
  return hex;
};

// 通过颜色和强度来缓存转化后的颜色
const colorCacheMap = new Map();

export const generateDarkAndLightColors = (
  color: string,
  { darkFactor = 0.8, lightConstant = 120 } = {}
): {
  darkColor: string;
  lightColor: string;
} => {
  let darkColor = colorCacheMap.get(String(color) + darkFactor);
  let lightColor = colorCacheMap.get(String(color) + lightConstant);
  if (darkColor && lightColor) {
    return { darkColor, lightColor };
  }

  if (color.length != 7 || color[0] != "#") {
    console.error("Invalid color format");
    return { darkColor: color, lightColor: color };
  }
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  const darkRGB = darken([r, g, b], darkFactor);
  const lightRGB = lighten([r, g, b], lightConstant);
  darkColor = rgbToHex(darkRGB);
  lightColor = rgbToHex(lightRGB);
  colorCacheMap.set(String(color) + darkFactor, darkColor);
  colorCacheMap.set(String(color) + lightConstant, lightColor);
  return { darkColor, lightColor };
};
