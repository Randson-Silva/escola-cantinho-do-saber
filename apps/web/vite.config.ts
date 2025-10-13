import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: true,
      port: parseInt(env.VITE_FRONT_PORT ?? '5173'),
    },
    root: path.resolve(__dirname, './src/renderer'),
  };
});
