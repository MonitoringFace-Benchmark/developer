import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps the build relocatable for a GitHub Pages project path;
// hash routing avoids any 404 tricks.
export default defineConfig({
  base: './',
  plugins: [react()],
});
