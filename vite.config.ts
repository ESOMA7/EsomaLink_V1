import { defineConfig, loadEnv } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env variables from the root directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
