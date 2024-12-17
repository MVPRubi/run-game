import { GLTFLoader, GLTF } from "three/addons/loaders/GLTFLoader.js";
import scene2 from "@assets/Model/scene2-3.glb";
import horse4 from "@assets/Model/horse4.glb";
import jiangbei from "@assets/Model/jiangbei.glb";

const assetList = [scene2, horse4, jiangbei];

export type IAssets = Partial<Record<"scene" | "horse" | "trophy", GLTF>>;

export const load = async (): Promise<IAssets> => {
  try {
    const loader = new GLTFLoader();
    const promises = assetList.map((asset) => {
      return loader.loadAsync(asset);
    });
    const assets = (await Promise.all(promises)) as GLTF[];

    return {
      scene: assets[0],
      horse: assets[1],
      trophy: assets[2],
    };
  } catch (error) {
    console.error(error);
  }

  return {};
};

export const release = () => {
  assetList.forEach((asset) => {
    URL.revokeObjectURL(asset);
  });
};
