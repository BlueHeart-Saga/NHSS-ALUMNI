import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 8080,
    host: true,
    allowedHosts: [
      'nhss-alumni-hucjandcaedncnhj.southindia-01.azurewebsites.net',
      '.azurewebsites.net',
      'localhost',
      '127.0.0.1'
    ]
  }
});
