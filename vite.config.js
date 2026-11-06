import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Pravesh uses a HashRouter and a relative base so the contents of dist/
// can be served from any static host or sub-path without rewrites.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: false },
  preview: { port: 4173 },
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 700 },
});
