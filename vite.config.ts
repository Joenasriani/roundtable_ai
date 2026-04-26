import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon-192.svg', 'icon-512.svg'],
          manifest: {
            name: 'Roundtable AI',
            short_name: 'Roundtable',
            description: 'Elite Interdisciplinary Reasoning Engine',
            theme_color: '#4f46e5',
            background_color: '#f8fafc',
            display: 'standalone',
            icons: [
              {
                src: 'icon-192.svg',
                sizes: '192x192',
                type: 'image/svg+xml'
              },
              {
                src: 'icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}']
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENROUTER_DEFAULT_MODEL': JSON.stringify(env.OPENROUTER_DEFAULT_MODEL),
        'process.env.OPENROUTER_FALLBACK_MODEL': JSON.stringify(env.OPENROUTER_FALLBACK_MODEL)
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (!id.includes('node_modules')) return;

              if (id.includes('recharts') || id.includes('d3-')) return 'charts';
              if (id.includes('jspdf')) return 'pdf';
              if (id.includes('@paypal')) return 'payments';
              if (id.includes('lucide-react')) return 'icons';
              if (id.includes('motion')) return 'animation';

              const packagePath = id.split('node_modules/')[1];
              if (!packagePath) return 'vendor';

              const segments = packagePath.split('/');
              const packageName = segments[0].startsWith('@') ? `${segments[0]}-${segments[1]}` : segments[0];
              return `vendor-${packageName.replace(/[^a-zA-Z0-9_-]/g, '')}`;
            }
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
