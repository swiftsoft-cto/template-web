import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = env.VITE_APP_BASE_NAME || '/';
  const PORT = 3000;

  return {
    base: API_URL,
    server: {
      open: true,
      port: PORT,
      host: true
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: 'window' // Only if you need it for legacy packages
    },
    resolve: {
      alias: {
        '@ant-design/icons': path.resolve(__dirname, 'node_modules/@ant-design/icons')
        // Add more aliases as needed
      },
      // Garante uma única instância de React em todas as libs
      dedupe: ['react', 'react-dom']
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin']
        }
      }),
      tsconfigPaths()
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: true,
      cssCodeSplit: true,
      // Only drop console/debugger in production
      ...(mode === 'production' && {
        esbuild: {
          drop: ['console', 'debugger'],
          pure: ['console.log', 'console.info', 'console.debug', 'console.warn']
        }
      })
      // No need to set build.target unless you need to support older browsers
      // target: 'baseline-widely-available', // This is now the default
    },
    optimizeDeps: {
      // Pré-bundle do essencial + CJS/icon libs que precisam de interop (default export)
      include: [
        'react',
        'react-dom',
        'react-is',
        'react-router-dom',
        '@emotion/react',
        '@emotion/styled',
        '@emotion/cache',
        'prop-types',
        '@ant-design/icons'
      ],
      exclude: ['@mui/material', 'notistack']
    }
  };
});
