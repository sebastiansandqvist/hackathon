import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  build: { minify: false, sourcemap: true },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env['VITE_API_URL'] || 'http://localhost:3000'),
  },
  resolve: {
    alias: [
      { find: '~/components', replacement: path.resolve(__dirname, './src/components/index.ts') },
      { find: '~/icons', replacement: path.resolve(__dirname, './src/icons/index.ts') },
      { find: '~/trpc', replacement: path.resolve(__dirname, './src/trpc.ts') },
      { find: '~/util', replacement: path.resolve(__dirname, './src/util.ts') },
    ],
  },
});
