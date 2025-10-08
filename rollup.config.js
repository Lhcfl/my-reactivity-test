import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  input: "app.tsx",
  output: {
    dir: "dist",
  },
  jsx: {
    mode: "classic",
    factory: "h",
    importSource: "./runtime.js",
  },
  plugins: [typescript({
    outDir: "dist",
  })]
});