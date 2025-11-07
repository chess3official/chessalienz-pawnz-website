import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        testMint: 'test-mint.html',
        testMintSimple: 'test-mint-simple.html'
      }
    }
  },
  server: {
    port: 3000
  }
});
