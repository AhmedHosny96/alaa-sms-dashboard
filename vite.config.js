import { defineConfig, loadEnv } from 'vite';
import fs from 'fs/promises';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import compileSCSS from './compile-scss';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const apiTarget = process.env.VITE_API_PROXY_TARGET || process.env.VITE_API_BASE_URL || 'http://localhost:8050';

  return defineConfig({
    plugins: [react(), jsconfigPaths(), compileSCSS()],
    base: process.env.VITE_PUBLIC_URL || '/',
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: []
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        },
        plugins: [
          {
            name: 'load-js-files-as-jsx',
            setup(build) {
              build.onLoad({ filter: /src\/.*\.js$/ }, async args => ({
                loader: 'jsx',
                contents: await fs.readFile(args.path, 'utf8')
              }));
            }
          }
        ]
      }
    },
    define: {
      global: 'window'
    },
    server: {
      open: true,
      port: Number(process.env.VITE_APP_PORT) || 6100,
      host: process.env.VITE_APP_HOST || 'localhost',
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    }
  });
};
