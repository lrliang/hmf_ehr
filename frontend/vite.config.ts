import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      eslint({
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['node_modules'],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/pages': resolve(__dirname, 'src/pages'),
        '@/services': resolve(__dirname, 'src/services'),
        '@/store': resolve(__dirname, 'src/store'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/hooks': resolve(__dirname, 'src/hooks'),
        '@/types': resolve(__dirname, 'src/types'),
        '@/assets': resolve(__dirname, 'src/assets'),
      },
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/auth/, '/api/v1/auth'),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            antd: ['antd', '@ant-design/icons'],
            redux: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          },
        },
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 移除 additionalData 避免重复导入
          // additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },
  };
});
