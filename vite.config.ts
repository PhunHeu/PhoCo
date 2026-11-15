import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
// The user's old game remains accessible in dev, but is not shipped in the new release.
const releaseAssets={name:'original-release-assets',apply:'build' as const,async writeBundle(){const out=resolve('dist');await mkdir(out,{recursive:true});await Promise.all(['icon.svg','manifest.json','sw.js'].map(name=>copyFile(resolve('public',name),resolve(out,name))));}};
export default defineConfig({ plugins: [react(),releaseAssets], server: { port: 5179, strictPort: true, watch: { ignored: ['**/.tools/**','**/test-results/**','**/backups/**'] }, proxy: { '/api': 'http://127.0.0.1:3179' } }, preview: {port: 4179, strictPort: true}, build: { copyPublicDir:false,rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } } } });
