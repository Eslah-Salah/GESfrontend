import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname, 'client'),
  build: {
    outDir: resolve(__dirname, 'public'),
    emptyOutDir: true,
  },
});
