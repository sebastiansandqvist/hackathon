import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  build: { minify: false },
  resolve: {
    alias: [
      { find: '~/components', replacement: path.resolve(__dirname, './src/components/index.ts') },
      { find: '~/trpc', replacement: path.resolve(__dirname, './src/trpc.ts') },
      { find: '~/util', replacement: path.resolve(__dirname, './src/util.ts') },
    ],
  },
});
