import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@': resolve(__dirname, './src'),
    },
    exclude: [
      '**/node_modules/**', 
      '**/.storybook/**', 
      '**/*.stories.*', 
      '**/dist/**',
      '**/.next/**',
    ],
  },
});
