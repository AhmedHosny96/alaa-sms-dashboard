import { defineConfig, loadEnv } from 'vite';
import fs from 'fs/promises';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import compileSCSS from './compile-scss';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

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
    // NEW: tell esbuild that .js files can contain JSX
    loader: {
      '.js': 'jsx'
    },
    // keep your existing plugin exactly as-is
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
      port: Number(process.env.VITE_APP_PORT) || 3000,
      host: process.env.VITE_APP_HOST || 'localhost'
    }
  });
};
