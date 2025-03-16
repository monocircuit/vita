import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */

    // SASS/SCSS Options
    sassOptions: {
        // Here you can add additional SASS Code that will always be added
        // into the SASS compilation process.
        additionalData: "",
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

    // Experimental Features
    experimental: {
        turbo: {
            rules: {
                "*.svg": {
                    loaders: ["@svgr/webpack"],
                    as: "*.ts",
                },
            },
        },
    },
};

export default nextConfig;
