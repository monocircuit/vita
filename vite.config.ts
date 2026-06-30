import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'static/icons/monocircuit.svg'],
      manifest: {
        name: 'Vita',
        short_name: 'Vita',
        description: 'Vita – interaktiver Lebenslauf-Editor, vollständig lokal im Browser.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0070f3',
        icons: [
          { src: '/static/icons/monocircuit-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/static/icons/monocircuit-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/static/icons/monocircuit-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: '/static/icons/monocircuit-1024x1024.png', sizes: '1024x1024', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // pixi.js + MUI bundles exceed the 2 MiB default; raise the limit so the
        // app shell is fully precached for offline use.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/font/local': path.resolve(__dirname, './src/shared/stubs/next-font-local.ts'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
