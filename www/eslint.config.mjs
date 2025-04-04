import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        languageOptions: {
            parser: typescriptEslintParser,
            parserOptions: {
                project: "./tsconfig.json", // Pfad zur tsconfig.json
                tsconfigRootDir: __dirname, // Root-Verzeichnis
            },
        },
        plugins: {
            typescriptEslintPlugin,
        },
        rules: {
            /** ANCHOR: Naming Conventions */
            "@typescript-eslint/naming-convention": [
                "error",
                // Boolean variables
                {
                    selector: "variable",
                    types: ["boolean"],
                    format: ["PascalCase"],
                    prefix: ["is", "should", "has", "can", "did", "will"],
                },
                // Functions
                {
                    selector: "function",
                    format: ["camelCase"],
                },
                // Classes and types
                {
                    selector: "class",
                    format: ["PascalCase"],
                },
                {
                    selector: "interface",
                    format: ["PascalCase"],
                    custom: {
                        regex: "^I[A-Z]",
                        match: false, // Avoid interfaces prefixed with "I"
                    },
                },
                {
                    selector: "typeAlias",
                    format: ["PascalCase"],
                },
                // Enums
                {
                    selector: "enum",
                    format: ["PascalCase"],
                },
                {
                    selector: "enumMember",
                    format: ["UPPER_CASE"],
                },
                {
                    selector: "property",
                    modifiers: ["readonly"],
                    format: ["UPPER_CASE"],
                },
                // Methods
                {
                    selector: "method",
                    format: ["camelCase"],
                },
                // Parameters
                {
                    selector: "parameter",
                    format: ["camelCase"],
                },
                // Type parameters
                {
                    selector: "typeParameter",
                    format: ["PascalCase"],
                    prefix: ["T"],
                },
            ],
        },
    },
];

export default eslintConfig;
