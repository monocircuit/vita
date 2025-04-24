import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */

  // SASS/SCSS Options
  sassOptions: {
    // Here you can add additional SASS Code that will always be added
    // into the SASS compilation process.
    additionalData: "",
  },

  // Necessary for nextjs to be able to resolve @monolithium
  // modules, that have been connected with this repo via
  // npm link.
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // Configuration for Turbopack to better work with SVG files.
  // It enables to import SVG files as React components.
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.ts",
      },
    },
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [{ removeViewBox: false }],
            },
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
