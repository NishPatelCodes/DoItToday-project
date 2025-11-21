import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh optimizations
      fastRefresh: true,
      // Exclude heavy libraries from JSX transform
      exclude: /node_modules/,
    }),
    // PWA plugin for offline support and caching
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'DoItToday - Productivity App',
        short_name: 'DoItToday',
        description: 'Organize your day, achieve more. The all-in-one productivity platform.',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        // Cache static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime caching for API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Disable sourcemaps in production for smaller bundles
    sourcemap: process.env.ANALYZE ? true : false,
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Minify with esbuild (faster than terser)
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Preload critical chunks for faster initial load
    rollupOptions: {
      output: {
        // Intelligent code splitting strategy
        // IMPORTANT: Let Vite handle React automatically to prevent module resolution issues
        manualChunks: (id) => {
          // Only split heavy libraries, let Vite handle React core automatically
          if (id.includes('node_modules')) {
            // Heavy animation library (lazy load)
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            // Chart library (lazy load)
            if (id.includes('recharts')) {
              return 'recharts';
            }
            // DnD kit (lazy load)
            if (id.includes('@dnd-kit')) {
              return 'dnd-kit';
            }
            // React icons (can be large, split by usage)
            if (id.includes('react-icons')) {
              return 'react-icons';
            }
            // Don't manually chunk React - let Vite handle it automatically
            // This prevents "Cannot read properties of undefined" errors
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    commonjsOptions: {
      include: [/react-icons/, /node_modules/],
    },
    // Enable tree-shaking
    treeshake: {
      moduleSideEffects: false,
    },
  },
  optimizeDeps: {
    // Pre-bundle heavy dependencies
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'zustand',
      'date-fns',
    ],
    // Exclude heavy libraries that should be lazy loaded
    exclude: ['framer-motion', 'recharts'],
  },
  // Enable CSS optimization
  css: {
    devSourcemap: false,
  },
});


