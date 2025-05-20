import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Use proxy only in development
  const isDev = mode === 'development';
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: isDev
        ? {
            '/api': 'http://localhost:5000',
          }
        : undefined,
    },
  };
});

