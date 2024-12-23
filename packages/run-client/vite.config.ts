import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.glb"],
  plugins: [
    react(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@utils": path.resolve(__dirname, "src/Utils"),
      "@services": path.resolve(__dirname, "src/Services"),
      "@components": path.resolve(__dirname, "src/Components"),
      "@constant": path.resolve(__dirname, "src/Constant"),
      "@types": path.resolve(__dirname, "src/types"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@entity": path.resolve(__dirname, "src/Entity"),
      "@event": path.resolve(__dirname, "src/Event"),
    },
  },
});
