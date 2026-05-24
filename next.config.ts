import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",

  // Transpile workspace packages that ship raw TypeScript source.
  transpilePackages: [
    "@monocircuit/monolithium",
    "@monocircuit/utilities",
    "@monocircuit/bridge",
    "@monocircuit/tanstack",
  ],

   allowedDevOrigins: ['10.1.20.159'],

  // SASS/SCSS Options
  sassOptions: {
    // Here you can add additional SASS Code that will always be added
    // into the SASS compilation process.
    additionalData: "",
  },

  // Needed for Next.js output tracing to include workspace packages.
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // Ensure Turbopack resolves workspace packages from the monorepo root.
  turbopack: {
    root: path.join(__dirname, "../../"),
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
