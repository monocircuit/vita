import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['node_modules', '.next', 'out', 'dist', 'dev-dist', '**/*.css', '**/*.scss', 'src/vendor/**', 'src/routeTree.gen.ts'],
  },
  js.configs.recommended,
  {
    // Node-based config + script files (not TypeScript source).
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // @pixi/react registers lowercase custom elements (pixiGraphics,
      // viewport, …). eslint-plugin-react only knows DOM elements and flags
      // their props as unknown, so exempt the pixi-specific ones.
      'react/no-unknown-property': ['error', { ignore: ['draw', 'events'] }],
      // TypeScript itself checks for undefined identifiers, and the core
      // `no-undef` rule produces false positives for types and DOM globals in
      // TS files — the typescript-eslint project recommends disabling it.
      'no-undef': 'off',
      // Same reasoning: TS declaration merging (e.g. a `const` and a `type` of
      // the same name) is valid and checked by tsc, but trips core
      // `no-redeclare`.
      'no-redeclare': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: { react: { version: 'detect' } },
  },
];
