import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env variables from the root directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.png', 'notification.mp3', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon-512x512.png', 'screenshot-desktop.png', 'screenshot-mobile.png'],
        manifest: {
          name: 'EsomaLink Clínica',
          short_name: 'EsomaLink',
          description: 'Gestión avanzada para clínica de estética',
          theme_color: '#f8fafc',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: '/screenshot-desktop.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide'
            },
            {
              src: '/screenshot-mobile.png',
              sizes: '750x1334',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          // Aumentamos el límite del tamaño del archivo para el service worker si tuvieras assets pesados
          maximumFileSizeToCacheInBytes: 3000000,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']
        }
      })
    ],
    define: {
      // Expose all env variables to the client under import.meta.env
      'import.meta.env': JSON.stringify(env),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
