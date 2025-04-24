import { defineConfig } from "eslint/config";
import { FlatConfigLoader } from "@monocircuit/eslint-config";

const flatConfig = await new FlatConfigLoader({
  javascript: {
    typescript: true,
    framework: "nextjs",
  },
  json: true,
}).load();

export default defineConfig([
  { ignores: ["node_modules", ".next"] },
  { extends: [flatConfig] },
]);
