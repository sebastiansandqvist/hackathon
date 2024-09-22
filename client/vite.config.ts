import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  build: { minify: false },
  resolve: {
    alias: [
      { find: '~/components', replacement: './src/components/index.ts' },
      { find: '~/trpc', replacement: './src/trpc.ts' },
      { find: '~/util', replacement: './src/util.ts' },
    ],
  },
});
